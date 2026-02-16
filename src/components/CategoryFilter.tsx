'use client';

interface CategoryFilterProps {
  activeCategory: '国内' | '全部';
  onChange: (category: '国内' | '全部') => void;
}

export default function CategoryFilter({ activeCategory, onChange }: CategoryFilterProps) {
  return (
    <div className="category-filter">
      <button
        className={`category-btn ${activeCategory === '国内' ? 'active' : ''}`}
        onClick={() => onChange('国内')}
      >
        国内
      </button>
      <button
        className={`category-btn ${activeCategory === '全部' ? 'active' : ''}`}
        onClick={() => onChange('全部')}
      >
        全部
      </button>
    </div>
  );
}
