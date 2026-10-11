
const CategoryProgression = ({ history = [], subject = "DBMS" }) => {
  const categoryStyle = {
    Gradual: "bg-[#FFF0F0] text-[#E5484D]",
    Growing: "bg-[#FFF5DF] text-[#B77905]",
    Gallant: "bg-[#E5F8EF] text-[#14965B]",
  };

  return (
    <section className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <h2 className="text-[15px] font-semibold text-[#20375D]">
        Category progression
      </h2>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[350px] text-left">
          <thead>
            <tr className="bg-[#F3F6FB]">
              <th className="px-3 py-3 text-xs font-semibold text-[#526581]">
                Checkpoint
              </th>
              <th className="px-3 py-3 text-xs font-semibold text-[#526581]">
                {subject} category
              </th>
              <th className="px-3 py-3 text-xs font-semibold text-[#526581]">
                Marks
              </th>
            </tr>
          </thead>

          <tbody>
            {history.length > 0 ? (
              history.map((item, index) => (
                <tr
                  key={`${item.checkpoint}-${index}`}
                  className="border-b border-[#E5EAF1] last:border-0"
                >
                  <td className="whitespace-nowrap px-3 py-5 text-xs font-medium text-[#20375D]">
                    {item.checkpoint}
                  </td>

                  <td className="px-3 py-5">
                    <span
                      className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
                        categoryStyle[item.category] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      • {item.category}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-5 text-xs text-[#20375D]">
                    {item.marks}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-6 text-center text-sm text-gray-500"
                >
                  No assessment history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CategoryProgression;
