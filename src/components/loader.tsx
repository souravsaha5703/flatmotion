import React from 'react';

interface LoaderProps {
    color?: string
}

const Loader: React.FC<LoaderProps> = ({ color = 'border-t-black' }) => {
    return (
        <div className={`w-8 h-8 border-4 ${color} border-gray-300 rounded-full animate-spin`}></div>
    )
}

export default Loader;