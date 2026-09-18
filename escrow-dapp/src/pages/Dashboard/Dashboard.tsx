import { AccountInfo } from "./AccountInfo";
import { CreatedOffers } from "./CreatedOffers";
import { CreateOffer } from "./CreateOffer";
import { ReceivedOffers } from "./ReceivedOffers";
import { useState } from "react";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"created" | "received">("created");

  return (
    <div className="w-full space-y-8">
      {/* Account Overview Header */}
      <AccountInfo />

      {/* Main Trade Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Create Offer Card */}
        <div className="lg:col-span-5 w-full">
          <CreateOffer />
        </div>

        {/* Right Column: Manage Offers */}
        <div className="lg:col-span-7 w-full space-y-6">
          {/* Navigation Filter Tabs */}
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-1 w-full">
              <button
                type="button"
                onClick={() => setActiveTab("created")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "created"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>My Created Offers</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("received")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "received"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                <span>Incoming Offers (To You)</span>
              </button>
            </div>
          </div>

          {/* Active Tab View */}
          <div className="w-full">
            {activeTab === "created" ? <CreatedOffers /> : <ReceivedOffers />}
          </div>
        </div>
      </div>
    </div>
  );
};
