'use client'
import React, { useState } from 'react';

interface TextTruncateProps {
    text: string;
    maxCharacters?: number;
    className?: string;
}

const TextTruncate: React.FC<TextTruncateProps> = ({ text, maxCharacters = 100, className }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = text.length > maxCharacters;

    const displayText = isExpanded ? text : text.slice(0, maxCharacters);
    const buttonText = isExpanded ? 'See less' : 'See more';

    const toggleExpanded = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center">
                <p className="mr-2">
                    {displayText}
                    {shouldTruncate && !isExpanded && '...'}
                    {shouldTruncate && (
                    <button
                        onClick={toggleExpanded}
                        className="ms-1 inline-block text-primary  text-sm font-medium focus:outline-none underline"
                    >
                        {buttonText}
                    </button>
                )}
                </p>
            </div>
        </div>
    );
};

export default TextTruncate;