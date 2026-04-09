import React from 'react';

const DropdownWithOptions = ({ label, name, value, options = [], onChange, required, optLabel, hasAny, hasOther = true, placeholder }) => {
    // If value is not in options (and not empty), it is a custom "Other" value
    const safeOptions = options || [];
    const isCustom = value && !safeOptions.includes(value) && value !== 'Any' && value !== 'Other' && value !== 'None';
    // The select should show 'Other' if it's a custom value
    const selectValue = isCustom ? 'Other' : (value || '');

    // For Onboarding vs MyProfile labeling styles
    const labelClasses = label.includes('e.g.') ? '' : 'info-label';

    return (
        <div className="ob-form-group">
            <label className={labelClasses}>
                {label} {required ? <span className="req">*Required</span> : (typeof optLabel === 'string' ? (optLabel ? <span className="opt">{optLabel}</span> : null) : <span className="opt">(Optional)</span>)}
            </label>
            <select 
                name={name} 
                value={selectValue} 
                onChange={(e) => {
                    if (e.target.value === 'Other') {
                        // Start with empty string for custom input
                        onChange({ target: { name, value: ' ' } }); // space to trigger input render
                    } else {
                        onChange(e);
                    }
                }} 
                className="ob-select" 
                style={{ marginBottom: (isCustom || selectValue === 'Other' || value === ' ') ? '0.5rem' : '0' }}
            >
                <option value="" disabled>Select {label.split(' ')[0].toLowerCase()}</option>
                {hasAny && <option value="Any">Any</option>}
                {safeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                {hasOther && <option value="Other">Other (Please specify)</option>}
            </select>
            {(isCustom || selectValue === 'Other' || value === ' ') && (
                <input 
                    type="text" 
                    name={name} 
                    value={value && value !== ' ' && value !== 'Other' ? value : ''} 
                    onChange={onChange} 
                    className="ob-input" 
                    placeholder={placeholder || `Specify your ${label.toLowerCase()}`} 
                    autoFocus
                />
            )}
        </div>
    );
};

export default DropdownWithOptions;
