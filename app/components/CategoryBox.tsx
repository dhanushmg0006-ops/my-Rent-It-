'use client';

import qs from 'query-string';
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { IconType } from "react-icons";

interface CategoryBoxProps {
  icon: IconType,
  label: string;
  selected?: boolean;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  icon: Icon,
  label,
  selected,
}) => {
  const router = useRouter();
  const params = useSearchParams();

  const handleClick = useCallback(() => {
    let currentQuery = {};
    
    if (params) {
      currentQuery = qs.parse(params.toString())
    }

    const updatedQuery: any = {
      ...currentQuery,
      category: label
    }

    if (params?.get('category') === label) {
      delete updatedQuery.category;
    }

    const url = qs.stringifyUrl({
      url: '/',
      query: updatedQuery
    }, { skipNull: true });

    router.push(url);
  }, [label, router, params]);

  return (
    <div
      onClick={handleClick}
      className={`
        group
        flex
        flex-col
        items-center
        justify-center
        gap-2
        px-5 py-3
        border-2
        rounded-2xl
        bg-white
        hover:bg-gradient-to-br hover:from-brand/5 hover:to-brand-dark/5
        hover:border-brand/30
        hover:shadow-lg
        hover:scale-105
        transition-all duration-300
        cursor-pointer
        min-w-[100px]
        ${selected ? 'border-brand bg-brand/5 text-brand font-semibold shadow-md' : 'border-gray-200 text-gray-700 hover:border-brand/50'}
      `}
    >
      <div className={`
        p-2 rounded-xl transition-all duration-300
        ${selected ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-600 group-hover:bg-brand/10 group-hover:text-brand'}
      `}>
        <Icon size={24} />
      </div>
      <div className={`
        font-medium text-sm text-center leading-tight transition-all duration-300
        ${selected ? 'text-brand' : 'group-hover:text-brand'}
      `}>
        {label}
      </div>
    </div>
   );
}
 
export default CategoryBox;