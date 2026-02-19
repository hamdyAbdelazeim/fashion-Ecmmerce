import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
            <h2 className="text-3xl font-bold mt-4 mb-2">Page Not Found</h2>
            <p className="text-gray-500 mb-8 max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link to="/" className="btn-primary bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors">
                Go to Homepage
            </Link>
        </div>
    );
};

export default NotFound;
