use multiversx_sc_scenario::imports::*;

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();

    // blockchain.set_current_dir_from_workspace("relative path to your workspace, if applicable");
    blockchain.register_contract("mxsc:output/token-escrow.mxsc.json", token_escrow::ContractBuilder);
    blockchain
}

#[test]
fn empty_rs() {
    world().run("scenarios/token_escrow.scen.json");
}

#[test]
fn cancel_offer_rs() {
    world().run("scenarios/cancel_offer.scen.json");
}
