const Spinner = ({ fullscreen = false, size = 'md' }) => {
    const sizes = {
        sm: 'h-5 w-5 border-2',
        md: 'h-10 w-10 border-2',
        lg: 'h-14 w-14 border-[3px]',
    };

    const spinner = (
        <div
            role="status"
            aria-label="Loading"
            className={`animate-spin rounded-full border-gray-200 border-t-gray-900 ${sizes[size]}`}
        />
    );

    if (fullscreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default Spinner;
