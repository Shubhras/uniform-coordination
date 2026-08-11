import { useState, useEffect, useMemo } from "react";
import Pager from "./Pagers";
import Prev from "./Prev";
import Next from "./Next";
import Total from "./Total";
import useControllableState from "../hooks/useControllableState";
import classNames from "classnames";
import { useTranslations } from "next-intl";

const defaultTotal = 5;

const Pagination = (props) => {
  const {
    className,
    currentPage = 1,
    displayTotal = false,
    onChange,
    onPageSizeChange,
    pageSize = 1,
    total = 5,
  } = props;

  const [paginationTotal] = useControllableState({
    prop: total,
    defaultProp: defaultTotal,
    onChange,
  });
  const t = useTranslations("productSpecification.fabric");


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

  // const pagerClass = {
  //     default: 'pagination-pager',
  //     inactive: 'pagination-pager-inactive',
  //     active: `text-primary dark:bg-primary dark:text-neutral`,
  //     disabled: 'pagination-pager-disabled',
  // }
  const pagerClass = {
    default:
      "w-9 h-9 flex items-center justify-center rounded-md cursor-pointer transition-all duration-200",
    inactive:
      "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F5F5F5]",
    active: "bg-[#DE8053] text-white",
    disabled: "border border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed",
  };

  // const paginationClass = classNames('pagination', className)
  const paginationClass = classNames(
    "flex items-center justify-end gap-2 mt-6",
    className,
  );
  const handlePageSizeChange = (e) => {
  const size = Number(e.target.value);

  setInternalPageSize(size);
  setInternalCurrentPage(1);

  onPageSizeChange?.(size);
};

  //   return (
  //     <div className={paginationClass}>
  //       {displayTotal && <Total total={total} />}
  //       <Prev
  //         currentPage={internalCurrentPage}
  //         pagerClass={pagerClass}
  //         onPrev={onPrev}
  //       />
  //       <Pager
  //         pageCount={getInternalPageCount}
  //         currentPage={internalCurrentPage}
  //         pagerClass={pagerClass}
  //         onChange={onPaginationChange}
  //       />
  //       <Next
  //         currentPage={internalCurrentPage}
  //         pageCount={getInternalPageCount}
  //         pagerClass={pagerClass}
  //         onNext={onNext}
  //       />
  //     </div>
  //   );

  return (
    <div className="flex items-center justify-between w-full mt-6">
      {/* Left */}
      <div className="text-sm text-[#7B7B7B]">
        {t("showing")}{" "}
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
