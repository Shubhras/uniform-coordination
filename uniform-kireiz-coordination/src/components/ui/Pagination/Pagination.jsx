import { useState, useEffect, useMemo } from "react";
import Pager from "./Pagers";
import Prev from "./Prev";
import Next from "./Next";
import Total from "./Total";
import useControllableState from "../hooks/useControllableState";
import classNames from "classnames";

const defaultTotal = 5;

const Pagination = (props) => {
  const {
    className,
    currentPage = 1,
    displayTotal = false,
    onChange,
    pageSize = 1,
    total = 5,
  } = props;

  const [paginationTotal] = useControllableState({
    prop: total,
    defaultProp: defaultTotal,
    onChange,
  });

  const [internalPageSize, setInternalPageSize] = useState(pageSize);

  const getInternalPageCount = useMemo(() => {
    if (typeof paginationTotal === "number") {
      return Math.ceil(paginationTotal / internalPageSize);
    }
    return null;
  }, [paginationTotal, internalPageSize]);

  const getValidCurrentPage = (count) => {
    const value = parseInt(count, 10);
    const internalPageCount = getInternalPageCount;
    let resetValue;
    if (!internalPageCount) {
      if (isNaN(value) || value < 1) {
        resetValue = 1;
      }
    } else {
      if (value < 1) {
        resetValue = 1;
      }
      if (value > internalPageCount) {
        resetValue = internalPageCount;
      }
    }

    if ((resetValue === undefined && isNaN(value)) || resetValue === 0) {
      resetValue = 1;
    }

    return resetValue === undefined ? value : resetValue;
  };

  const [internalCurrentPage, setInternalCurrentPage] = useState(
    currentPage ? getValidCurrentPage(currentPage) : 1,
  );

  useEffect(() => {
    if (pageSize !== internalPageSize) {
      setInternalPageSize(pageSize);
    }

    if (currentPage !== internalCurrentPage) {
      setInternalCurrentPage(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, currentPage]);

  const onPaginationChange = (val) => {
    setInternalCurrentPage(getValidCurrentPage(val));
    onChange?.(getValidCurrentPage(val));
  };

  const onPrev = () => {
    const newPage = internalCurrentPage - 1;
    setInternalCurrentPage(getValidCurrentPage(newPage));
    onChange?.(getValidCurrentPage(newPage));
  };

  const onNext = () => {
    const newPage = internalCurrentPage + 1;
    setInternalCurrentPage(getValidCurrentPage(newPage));
    onChange?.(getValidCurrentPage(newPage));
  };

  const pagerClass = {
    default:
      "pagination-pager flex items-center justify-center w-9 h-9 rounded-md transition-colors",
    inactive:
      "pagination-pager-inactive bg-white text-[#64748B] border border-[#E5E7EB] hover:bg-gray-100",
    active: "bg-[#1C4FA8] text-white border border-[#1C4FA8]",
    disabled: "pagination-pager-disabled opacity-50 cursor-not-allowed",
  };

  const paginationClass = classNames("pagination", className);

  // return (
  //     <div className={paginationClass}>
  //         {displayTotal && <Total total={total} />}
  //         <Prev
  //             currentPage={internalCurrentPage}
  //             pagerClass={pagerClass}
  //             onPrev={onPrev}
  //         />
  //         <Pager
  //             pageCount={getInternalPageCount}
  //             currentPage={internalCurrentPage}
  //             pagerClass={pagerClass}
  //             onChange={onPaginationChange}
  //         />
  //         <Next
  //             currentPage={internalCurrentPage}
  //             pageCount={getInternalPageCount}
  //             pagerClass={pagerClass}
  //             onNext={onNext}
  //         />
  //     </div>
  // )
  return (
    <div className="flex items-center justify-between w-full mt-6">
      {/* Left */}
      <div className="text-sm text-[#7B7B7B]">
        Showing{" "}
        <span className="font-medium">
          {paginationTotal === 0
            ? 0
            : (internalCurrentPage - 1) * internalPageSize + 1}
        </span>
        –
        <span className="font-medium">
          {Math.min(internalCurrentPage * internalPageSize, paginationTotal)}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Prev
          currentPage={internalCurrentPage}
          pagerClass={pagerClass}
          onPrev={onPrev}
        />

        <Pager
          pageCount={getInternalPageCount}
          currentPage={internalCurrentPage}
          pagerClass={pagerClass}
          onChange={onPaginationChange}
        />

        <Next
          currentPage={internalCurrentPage}
          pageCount={getInternalPageCount}
          pagerClass={pagerClass}
          onNext={onNext}
        />
      </div>
    </div>
  );
};

Pagination.displayName = "Pagination";

export default Pagination;
