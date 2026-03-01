// Mock data – in a real app this would come from API
const subscription = {
  status: "active" as const,
  tier: "Professional",
  daysRemaining: 42,
  renewalDate: "2025-04-15",
  price: "199",
  currency: "€",
  billing: "annual" as const,
  features: [
    { label: "Unlimited buildings", icon: "las la-building", desc: "Add and manage all your projects" },
    { label: "Unlimited investor accounts", icon: "las la-user-friends", desc: "Create accounts for every investor" },
    { label: "Request management", icon: "las la-tasks", desc: "Handle site tours, utilities & more" },
    { label: "Priority support", icon: "las la-headset", desc: "Faster response from our team" },
  ],
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StaffSubscriptionPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
        Subscription
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        Plan and billing
      </p>

      <div className="mt-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Plan
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">
                {subscription.tier}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {subscription.price}{subscription.currency}
                <span className="text-gray-400">/{subscription.billing === "annual" ? "year" : "month"}</span>
              </p>
            </div>
            <span
              className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium ${
                subscription.status === "active"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {subscription.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Days left</p>
              <p className="text-xl font-semibold text-gray-900 mt-0.5">
                {subscription.daysRemaining}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Renewal</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {formatDate(subscription.renewalDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            Included in your plan
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {subscription.features.map((feature, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="size-10 shrink-0 rounded-lg bg-[#134e4a]/10 flex items-center justify-center text-[#134e4a]">
                  <i className={`las ${feature.icon} text-lg`} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {feature.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-[#134e4a] text-white text-sm font-medium hover:bg-[#115e59] transition-colors"
          >
            Manage
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
