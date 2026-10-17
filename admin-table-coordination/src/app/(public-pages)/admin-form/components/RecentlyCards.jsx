"use client";

const RecentlyCards = ({ data }) => {
  const recentProducts = data?.Recently_update_product_color_part || [];

  const salesReps = data?.Pending_Sales_Representation_Action || {};

  const salesRepsList = Object.entries(salesReps).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count,
  }));

  return (
    // <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="flex flex-col gap-6">
      {/* Recently Updated Products / Colour Parts */}
      <div className="bg-[#FDF4EB]/60 border border-[#E8DDD4] rounded-xl shadow-sm p-5">
        <h3 className="text-[#2A211D] text-[14px] font-semibold">
          Recently Updated Products
        </h3>

        <div className="mt-4 space-y-4 text-sm text-[#786D66]">
          {recentProducts.length > 0 ? (
            recentProducts.map((product, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="font-medium text-[#2A211D]">{product.partcname}</span>
                <span className="text-[#8C7E74]">{product.created_date}</span>
              </div>
            ))
          ) : (
            <p className="text-[#8C7E74] text-center py-2">No recent updates</p>
          )}
        </div>
      </div>

      {/* Pending Sales Representation Action */}
      <div className="bg-[#FDF4EB]/60 border border-[#E8DDD4] rounded-xl shadow-sm p-5">
        <h3 className="text-[#2A211D] text-[14px] font-semibold">
          Active Sales Representative
        </h3>

        <div className="mt-4 space-y-4 text-sm text-[#786D66]">
          {salesRepsList.length > 0 ? (
            salesRepsList.map((rep, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="font-medium text-[#2A211D]">{rep.name}</span>
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#A0522D] font-semibold text-sm shadow-sm border border-[#F3CDB6]">
                  {rep.count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[#8C7E74] text-center py-2">No active reps</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentlyCards;
