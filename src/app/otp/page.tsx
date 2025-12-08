'use client';

import * as React from 'react';
import { OTPInput } from '~/components/ui/otp-input';
import { cn } from '~/lib/utils';

interface OTPDemoState {
  singleFieldValue: string;
  multipleFieldValue: string;
  isLoading: boolean;
  singleFieldError: string;
  multipleFieldError: string;
  singleFieldSuccess: string;
  multipleFieldSuccess: string;
  showVerifyButton: boolean;
  showCounter: boolean;
}

const OTPPage: React.FC = () => {
  const [state, setState] = React.useState<OTPDemoState>({
    singleFieldValue: '',
    multipleFieldValue: '',
    isLoading: false,
    singleFieldError: '',
    multipleFieldError: '',
    singleFieldSuccess: '',
    multipleFieldSuccess: '',
    showVerifyButton: false,
    showCounter: true
  });

  const [config, setConfig] = React.useState({
    length: 6,
    autoFocus: true,
    showCounter: true,
    disabled: false
  });

  const handleSingleFieldChange = React.useCallback((value: string) => {
    setState(prev => ({ ...prev, singleFieldValue: value, error: '', singleFieldSuccess: '', multipleFieldSuccess: '', singleFieldError: '' }));
  }, []);

  const handleMultipleFieldChange = React.useCallback((value: string) => {
    setState(prev => ({ ...prev, multipleFieldValue: value, error: '', singleFieldSuccess: '', multipleFieldSuccess: '', multipleFieldError: '' }));
  }, []);

  const handleSingleFieldComplete = React.useCallback((value: string) => {
    setState(prev => ({ ...prev, singleFieldSuccess: 'OTP entered successfully!', singleFieldError: '' }));
  }, []);

  const handleMultipleFieldComplete = React.useCallback((value: string) => {
    setState(prev => ({ ...prev, multipleFieldSuccess: 'OTP entered successfully!', multipleFieldError: '' }));
  }, []);

  const handleVerify = React.useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: '', singleFieldSuccess: '', multipleFieldSuccess: '', singleFieldError: '', 
      multipleFieldError: ''
     }));
    
    // Simulate API call
    setTimeout(() => {
      const isSingleFieldValid = state.singleFieldValue.length === config.length;
      const isMultipleFieldValid = state.multipleFieldValue.length === config.length;

     setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          singleFieldSuccess: isSingleFieldValid ? 'Code verified successfully!' : '',
          multipleFieldSuccess: isMultipleFieldValid ? 'Code verified successfully!' : '',
          singleFieldError: isSingleFieldValid ? '' : 'Invalid code. Please try again.',
          multipleFieldError: isMultipleFieldValid ? '' : 'Invalid code. Please try again.'
        }));

    }, 2000);
  }, [state]);

  const handleTestError = React.useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      error: 'Invalid code. Please try again.',
      singleFieldSuccess: '',
      multipleFieldSuccess: '',
      singleFieldError: 'Invalid code. Please try again.',
      multipleFieldError: 'Invalid code. Please try again.'
    }));
  }, []);

  const handleClear = React.useCallback(() => {
    setState({
      singleFieldValue: '',
      multipleFieldValue: '',
      isLoading: false,
      singleFieldError: '',
      multipleFieldError: '',
      singleFieldSuccess: '',
      multipleFieldSuccess: '',
      showVerifyButton: false,
      showCounter: true
    });
  }, []);

  const handleConfigChange = React.useCallback((key: keyof typeof config, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-[70rem] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            OTP Input Component Demo
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive OTP input with single and multiple field variations
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Length
              </label>
              <select
                value={config.length}
                onChange={(e) => handleConfigChange('length', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={4}>4 digits</option>
                <option value={6}>6 digits</option>
                <option value={8}>8 digits</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.autoFocus}
                  onChange={(e) => handleConfigChange('autoFocus', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Auto Focus</span>
              </label>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.showCounter}
                  onChange={(e) => handleConfigChange('showCounter', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Counter</span>
              </label>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.disabled}
                  onChange={(e) => handleConfigChange('disabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Disabled</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Single Field Variation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Single Field Variation
            </h2>
            
            <div className="space-y-6">
              <OTPInput
                variant="single"
                length={config.length}
                value={state.singleFieldValue}
                onChange={handleSingleFieldChange}
                onComplete={handleSingleFieldComplete}
                isLoading={state.isLoading}
                error={state.singleFieldError}
                success={state.singleFieldSuccess}
                autoFocus={config.autoFocus}
                showCounter={config.showCounter}
                disabled={config.disabled}
                // showVerifyButton={state.singleFieldValue.length === config.length}
                onVerify={handleVerify}
                className="mb-4"
              />
              
              <div className="text-center text-sm text-gray-600">
                Current value: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {state.singleFieldValue || 'empty'}
                </span>
              </div>
            </div>
          </div>

          {/* Multiple Fields Variation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Multiple Fields Variation
            </h2>
            
            <div className="space-y-6">
              <OTPInput
                variant="multiple"
                length={config.length}
                value={state.multipleFieldValue}
                onChange={handleMultipleFieldChange}
                onComplete={handleMultipleFieldComplete}
                isLoading={state.isLoading}
                error={state.multipleFieldError}
                success={state.multipleFieldSuccess}
                autoFocus={config.autoFocus}
                disabled={config.disabled}
                placeholderChar="•"
                showCounter={config.showCounter}
                // showVerifyButton={state.multipleFieldValue.length === config.length}
                onVerify={handleVerify}
                className="mb-4"
              />
              
              <div className="text-center text-sm text-gray-600">
                Current value: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {state.multipleFieldValue || 'empty'}
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* Control Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={handleVerify}
            disabled={state.isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.isLoading ? 'Verifying...' : 'Test Verification'}
          </button>
          
          <button
            onClick={handleTestError}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Test Error State
          </button>
          
          <button
            onClick={handleClear}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear All
          </button>
        </div>

      </div>
    </div>
  );
};

export default OTPPage;