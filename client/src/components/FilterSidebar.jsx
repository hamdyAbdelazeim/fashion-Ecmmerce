import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const FilterSidebar = ({ isOpen, onClose, onFilterChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        department: searchParams.get('department') || '',
        sizes: searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [],
        colors: searchParams.get('colors') ? searchParams.get('colors').split(',') : [],
        priceRange: searchParams.get('priceRange') || '',
    });

    const categories = ['Clothing', 'Shoes'];
    const departments = ['Men', 'Women', 'Kids'];
    const sizes = ['S', 'M', 'L', 'XL'];
    const colors = ['White', 'Black', 'Blue', 'Red', 'Green', 'Brown'];
    const prices = [
        { label: 'Under $50', value: '0-50' },
        { label: '$50 - $100', value: '50-100' },
        { label: 'Over $100', value: '100-1000' },
    ];

    useEffect(() => {
        // Update URL when filters change
        const params = {};
        if (filters.category) params.category = filters.category;
        if (filters.department) params.department = filters.department;
        if (filters.sizes.length > 0) params.sizes = filters.sizes.join(',');
        if (filters.colors.length > 0) params.colors = filters.colors.join(',');
        if (filters.priceRange) params.priceRange = filters.priceRange;
        setSearchParams(params);
        onFilterChange(filters);
    }, [filters, setSearchParams]);

    const handleCheckboxChange = (type, value) => {
        setFilters(prev => {
            const current = prev[type];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [type]: updated };
        });
    };

    const handleRadioChange = (type, value) => {
        setFilters(prev => ({ ...prev, [type]: prev[type] === value ? '' : value }));
    };

    return (
        <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 overflow-y-auto pt-20 pb-10 px-6 lg:translate-x-0 lg:static lg:h-auto lg:shadow-none lg:pt-0 lg:block`}>
            <div className="flex justify-between items-center lg:hidden mb-6">
                <h3 className="text-xl font-bold font-serif">Filters</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-black">Close</button>
            </div>

            {/* Departments */}
            <div className="mb-8">
                <h4 className="font-medium mb-3 text-sm tracking-wider uppercase">Department</h4>
                <div className="space-y-2">
                    {departments.map(dept => (
                        <label key={dept} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="department"
                                checked={filters.department === dept}
                                onChange={() => handleRadioChange('department', dept)}
                                className="accent-black"
                            />
                            <span className="text-sm text-gray-600 hover:text-black">{dept}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
                <h4 className="font-medium mb-3 text-sm tracking-wider uppercase">Category</h4>
                <div className="space-y-2">
                    {categories.map(cat => (
                        <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="category"
                                checked={filters.category === cat}
                                onChange={() => handleRadioChange('category', cat)}
                                className="accent-black"
                            />
                            <span className="text-sm text-gray-600 hover:text-black">{cat}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
                <h4 className="font-medium mb-3 text-sm tracking-wider uppercase">Size</h4>
                <div className="grid grid-cols-4 gap-2">
                    {sizes.map(size => (
                        <button
                            key={size}
                            onClick={() => handleCheckboxChange('sizes', size)}
                            className={`py-2 text-sm border ${filters.sizes.includes(size) ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'} transition-colors`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div className="mb-8">
                <h4 className="font-medium mb-3 text-sm tracking-wider uppercase">Color</h4>
                <div className="flex flex-wrap gap-3">
                    {colors.map(color => (
                        <button
                            key={color}
                            onClick={() => handleCheckboxChange('colors', color)}
                            className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center ${filters.colors.includes(color) ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                        />
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
                <h4 className="font-medium mb-3 text-sm tracking-wider uppercase">Price</h4>
                <div className="space-y-2">
                    {prices.map(price => (
                        <label key={price.value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="priceRange"
                                checked={filters.priceRange === price.value}
                                onChange={() => handleRadioChange('priceRange', price.value)}
                                className="accent-black"
                            />
                            <span className="text-sm text-gray-600 hover:text-black">{price.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button
                onClick={() => setFilters({ category: '', department: '', sizes: [], colors: [], priceRange: '' })}
                className="w-full py-2 text-sm underline hover:text-accent"
            >
                Clear All Filters
            </button>
        </div>
    );
};

export default FilterSidebar;
