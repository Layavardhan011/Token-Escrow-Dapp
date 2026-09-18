#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq, Eq, Debug)]
pub enum OfferStatus {
    Active,
    Accepted,
    Cancelled,
}

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, Debug)]
pub struct Offer<M: ManagedTypeApi> {
    pub id: u64,
    pub creator: ManagedAddress<M>,
    pub accepted_address: ManagedAddress<M>,
    pub offered_payment: EgldOrEsdtTokenPayment<M>,
    pub wanted_payment: EgldOrEsdtTokenPayment<M>,
    pub deadline: u64,
    pub status: OfferStatus,
}

/// Token Escrow Smart Contract on MultiversX.
/// Enables secure, trustless peer-to-peer token and asset swaps.
#[multiversx_sc::contract]
pub trait TokenEscrow {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    /// Stores the offer on the blockchain and locks the deposited tokens in escrow.
    #[payable("*")]
    #[endpoint(createOffer)]
    fn create_offer(
        &self,
        accepted_address: ManagedAddress,
        wanted_token_identifier: EgldOrEsdtTokenIdentifier,
        wanted_token_nonce: u64,
        wanted_amount: BigUint,
        deadline: u64,
    ) -> u64 {
        let payment = self.call_value().egld_or_single_esdt();
        require!(payment.amount > 0, "Offered amount must be greater than zero");
        require!(wanted_amount > 0, "Wanted amount must be greater than zero");

        let current_time = self.blockchain().get_block_timestamp_seconds().as_u64_seconds();
        if deadline > 0 {
            require!(deadline > current_time, "Deadline must be in the future");
        }

        let caller = self.blockchain().get_caller();
        let offer_id = self.last_offer_id().get() + 1;
        self.last_offer_id().set(offer_id);

        let wanted_payment = EgldOrEsdtTokenPayment::new(
            wanted_token_identifier,
            wanted_token_nonce,
            wanted_amount,
        );

        let offer = Offer {
            id: offer_id,
            creator: caller.clone(),
            accepted_address: accepted_address.clone(),
            offered_payment: payment,
            wanted_payment,
            deadline,
            status: OfferStatus::Active,
        };

        let offer_to_store = offer.clone();
        self.offers(offer_id).set(&offer);
        self.all_offer_ids().insert(offer_id);
        self.user_created_offers(&caller).insert(offer_id);

        if !accepted_address.is_zero() {
            self.user_received_offers(&accepted_address).insert(offer_id);
        }

        self.offer_created_event(
            offer_id,
            &caller,
            &accepted_address,
            &offer_to_store,
        );

        offer_id
    }

    /// Cancels the specified offer, returning the locked tokens to the creator.
    #[endpoint(cancelOffer)]
    fn cancel_offer(&self, offer_id: u64) {
        require!(!self.offers(offer_id).is_empty(), "Offer does not exist");
        let mut offer = self.offers(offer_id).get();
        require!(offer.status == OfferStatus::Active, "Offer is not active");

        let caller = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp_seconds().as_u64_seconds();
        let is_expired = offer.deadline > 0 && current_time > offer.deadline;

        require!(
            caller == offer.creator || is_expired,
            "Only creator can cancel an active non-expired offer"
        );

        offer.status = OfferStatus::Cancelled;
        self.offers(offer_id).set(&offer);
        self.all_offer_ids().swap_remove(&offer_id);

        self.send().direct(
            &offer.creator,
            &offer.offered_payment.token_identifier,
            offer.offered_payment.token_nonce,
            &offer.offered_payment.amount,
        );

        self.offer_cancelled_event(offer_id, &caller);
    }

    /// Completes the trade and transfers assets to both parties.
    #[payable("*")]
    #[endpoint(acceptOffer)]
    fn accept_offer(&self, offer_id: u64) {
        require!(!self.offers(offer_id).is_empty(), "Offer does not exist");
        let mut offer = self.offers(offer_id).get();
        require!(offer.status == OfferStatus::Active, "Offer is not active");

        let current_time = self.blockchain().get_block_timestamp_seconds().as_u64_seconds();
        if offer.deadline > 0 {
            require!(current_time <= offer.deadline, "Offer has expired");
        }

        let caller = self.blockchain().get_caller();
        if !offer.accepted_address.is_zero() {
            require!(
                caller == offer.accepted_address,
                "Caller is not the designated recipient"
            );
        }

        let payment = self.call_value().egld_or_single_esdt();
        require!(
            payment.token_identifier == offer.wanted_payment.token_identifier,
            "Incorrect token sent"
        );
        require!(
            payment.token_nonce == offer.wanted_payment.token_nonce,
            "Incorrect token nonce"
        );
        require!(
            payment.amount == offer.wanted_payment.amount,
            "Incorrect payment amount"
        );

        offer.status = OfferStatus::Accepted;
        self.offers(offer_id).set(&offer);
        self.all_offer_ids().swap_remove(&offer_id);

        // Transfer incoming payment to the offer creator
        self.send().direct(
            &offer.creator,
            &payment.token_identifier,
            payment.token_nonce,
            &payment.amount,
        );

        // Transfer locked escrow deposit to the accepter
        self.send().direct(
            &caller,
            &offer.offered_payment.token_identifier,
            offer.offered_payment.token_nonce,
            &offer.offered_payment.amount,
        );

        self.offer_accepted_event(offer_id, &caller, &offer.creator);
    }

    // --- Views ---

    #[view(getOffer)]
    fn get_offer(&self, offer_id: u64) -> Option<Offer<Self::Api>> {
        if self.offers(offer_id).is_empty() {
            None
        } else {
            Some(self.offers(offer_id).get())
        }
    }

    #[view(getOffers)]
    fn get_offers(&self) -> MultiValueEncoded<Offer<Self::Api>> {
        let mut result = MultiValueEncoded::new();
        for offer_id in self.all_offer_ids().iter() {
            if !self.offers(offer_id).is_empty() {
                let offer = self.offers(offer_id).get();
                if offer.status == OfferStatus::Active {
                    result.push(offer);
                }
            }
        }
        result
    }

    #[view(getOffersForUser)]
    fn get_offers_for_user(&self, user: ManagedAddress) -> MultiValueEncoded<Offer<Self::Api>> {
        let mut result = MultiValueEncoded::new();
        for offer_id in self.user_created_offers(&user).iter() {
            if !self.offers(offer_id).is_empty() {
                result.push(self.offers(offer_id).get());
            }
        }
        for offer_id in self.user_received_offers(&user).iter() {
            if !self.offers(offer_id).is_empty() {
                let offer = self.offers(offer_id).get();
                if offer.creator != user {
                    result.push(offer);
                }
            }
        }
        result
    }

    #[view(getCreatedOffers)]
    fn get_created_offers(&self, user: ManagedAddress) -> MultiValueEncoded<Offer<Self::Api>> {
        let mut result = MultiValueEncoded::new();
        for offer_id in self.user_created_offers(&user).iter() {
            if !self.offers(offer_id).is_empty() {
                result.push(self.offers(offer_id).get());
            }
        }
        result
    }

    #[view(getReceivedOffers)]
    fn get_received_offers(&self, user: ManagedAddress) -> MultiValueEncoded<Offer<Self::Api>> {
        let mut result = MultiValueEncoded::new();
        for offer_id in self.user_received_offers(&user).iter() {
            if !self.offers(offer_id).is_empty() {
                result.push(self.offers(offer_id).get());
            }
        }
        result
    }

    // --- Events ---

    #[event("offerCreated")]
    fn offer_created_event(
        &self,
        #[indexed] offer_id: u64,
        #[indexed] creator: &ManagedAddress,
        #[indexed] accepted_address: &ManagedAddress,
        offer: &Offer<Self::Api>,
    );

    #[event("offerCancelled")]
    fn offer_cancelled_event(
        &self,
        #[indexed] offer_id: u64,
        #[indexed] caller: &ManagedAddress,
    );

    #[event("offerAccepted")]
    fn offer_accepted_event(
        &self,
        #[indexed] offer_id: u64,
        #[indexed] caller: &ManagedAddress,
        #[indexed] creator: &ManagedAddress,
    );

    // --- Storage Mappers ---

    #[view(getLastOfferId)]
    #[storage_mapper("last_offer_id")]
    fn last_offer_id(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("offers")]
    fn offers(&self, offer_id: u64) -> SingleValueMapper<Offer<Self::Api>>;

    #[storage_mapper("all_offer_ids")]
    fn all_offer_ids(&self) -> UnorderedSetMapper<u64>;

    #[storage_mapper("user_created_offers")]
    fn user_created_offers(&self, user: &ManagedAddress) -> UnorderedSetMapper<u64>;

    #[storage_mapper("user_received_offers")]
    fn user_received_offers(&self, user: &ManagedAddress) -> UnorderedSetMapper<u64>;
}
