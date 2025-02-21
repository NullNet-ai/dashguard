'use client'
import React, { useEffect, useState } from 'react';
import { Progress } from '~/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { RefreshCw, Check, Timer, AlertCircle } from 'lucide-react';

const ProgressExamples = () => {
    const [progress1, setProgress1] = useState(0);
    const [progress2, setProgress2] = useState(0);
    const [progress3, setProgress3] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const interval1 = setInterval(() => {
            setProgress1(prev => prev >= 100 ? 100 : prev + 1);
        }, 500);

        const interval2 = setInterval(() => {
            setProgress2(prev => prev >= 100 ? 100 : prev + 2);
        }, 500);

        const interval3 = setInterval(() => {
            setProgress3(prev => {
                const newValue = prev + 5;
                if (newValue >= 100) {
                    setIsComplete(true);
                    return 100;
                }
                return newValue;
            });
        }, 500);

        return () => {
            clearInterval(interval1);
            clearInterval(interval2);
            clearInterval(interval3);
        };
    }, []);

    const customLabel = (percentage: number) => (
        <div className="flex items-center gap-2">
            {percentage < 100 ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
                <Check className="w-4 h-4 text-green-500" />
            )}
            <span>{percentage}%</span>
        </div>
    );

    const timeLabel = (percentage: number) => (
        <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span>{percentage} minutes remaining</span>
        </div>
    );

    const statusLabel = (percentage: number) => (
        <div className="flex items-center gap-2">
            {percentage < 30 && <AlertCircle className="w-4 h-4 text-red-500" />}
            {percentage >= 30 && percentage < 70 && <RefreshCw className="w-4 h-4 text-yellow-500" />}
            {percentage >= 70 && <Check className="w-4 h-4 text-green-500" />}
            <span>Status: {percentage < 30 ? 'Critical' : percentage < 70 ? 'In Progress' : 'Good'}</span>
        </div>
    );

    return (
        <div className="space-y-8 p-6">
            {/* Linear Progress Variations */}
            <Card>
                <CardHeader>
                    <CardTitle>Linear Progress - Label Positions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Start Position</p>
                        <Progress type="linear" value={progress1} showLabel labelPosition="start" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Start Outside Position</p>
                        <Progress type="linear" value={progress1} showLabel labelPosition="start-outside" labelColor='black' />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Follow Position</p>
                        <Progress type="linear" value={progress1} showLabel labelPosition="follow" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">End Position</p>
                        <Progress type="linear" value={progress1} showLabel labelPosition="end" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">End Outside Position</p>
                        <Progress type="linear" value={progress1} showLabel labelPosition="end-outside" labelColor='black' />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Linear Progress - Custom Labels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">With Icon</p>
                        <Progress type="linear" value={progress2} label={customLabel} labelPosition="end" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Time Remaining</p>
                        <Progress type="linear" value={progress2} label={timeLabel} labelPosition="end" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Status Indicator</p>
                        <Progress type="linear" value={progress2} label={statusLabel} labelPosition="end" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Linear Progress - Limits and Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">With Max Limit (50)</p>
                        <Progress type="linear" value={progress3} maxLimit={50} showLabel labelPosition="follow" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Custom Min/Max (50-150)</p>
                        <Progress type="linear" value={progress3} min={50} max={150} showLabel labelPosition="follow" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Custom Colors</p>
                        <Progress
                            type="linear"
                            value={progress3}
                            primaryColor="#8b5cf6"
                            secondaryColor="#ddd6fe"
                            showLabel
                            labelPosition="follow"
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Color Thresholds</p>
                        <Progress
                            type="linear"
                            value={progress3}
                            showLabel
                            labelPosition="follow"
                            colorThresholds={[
                                { percentage: 0, color: '#ef4444' },
                                { percentage: 50, color: '#eab308' },
                                { percentage: 80, color: '#22c55e' }
                            ]}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Linear Progress - Advanced Variations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Negative min value example */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Negative Range (min=-50, max=50)</p>
                        <Progress
                            type="linear"
                            value={25}
                            min={-50}
                            max={50}
                            showLabel
                            labelPosition="end"
                            label={(percentage) => `${((50 + 25) / 100 * 100).toFixed(1)}%`}
                        />
                    </div>

                    {/* Label color example */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Custom Label Color</p>
                        <Progress
                            type="linear"
                            value={progress2}
                            showLabel
                            labelColor="#dc2626"
                            labelPosition="end"
                        />
                    </div>

                    {/* String label example */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">String Label</p>
                        <Progress
                            type="linear"
                            value={progress3}
                            showLabel
                            label="Loading..."
                            labelPosition="end-outside"
                            labelColor='black'
                        />
                    </div>

                    {/* Hidden label example */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Hidden Label</p>
                        <Progress
                            type="linear"
                            value={progress1}
                            showLabel={false}
                        />
                    </div>

                    {/* Text color in thresholds */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Threshold Text Colors</p>
                        <Progress
                            type="linear"
                            value={progress3}
                            showLabel
                            labelPosition="follow"
                            colorThresholds={[
                                { percentage: 0, color: '#ef4444', textColor: '#450a0a' },
                                { percentage: 30, color: '#eab308', textColor: '#422006' },
                                { percentage: 70, color: '#22c55e', textColor: '#052e16' }
                            ]}
                        />
                    </div>

                    {/* Custom class name */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Custom Styling</p>
                        <Progress
                            type="linear"
                            value={progress2}
                            className="h-8 rounded-full border-2 border-gray-200"
                            primaryColor="#3b82f6"
                            secondaryColor="#bfdbfe"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Radial Progress - Sizes and Colors</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center space-y-2">
                        <p className="text-sm font-medium">Custom Colors</p>
                        <Progress
                            type="radial"
                            value={progress2}
                            primaryColor="#8b5cf6"
                            secondaryColor="#ddd6fe"
                            showLabel
                            labelPosition="follow"
                        />
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <p className="text-sm font-medium">With Max Limit (50)</p>
                        <Progress
                            type="radial"
                            value={progress2}
                            maxLimit={50}
                            showLabel
                            labelPosition="follow"
                        />
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <p className="text-sm font-medium">Color Thresholds</p>
                        <Progress
                            type="radial"
                            value={progress2}
                            showLabel
                            labelPosition="follow"
                            colorThresholds={[
                                { percentage: 0, color: '#ef4444' },
                                { percentage: 50, color: '#eab308' },
                                { percentage: 80, color: '#22c55e' }
                            ]}
                        />
                    </div>
                </CardContent>
            </Card>

            

            <Card>
                <CardHeader>
                    <CardTitle>Radial Progress - Advanced Variations</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   
                    {/* Radial with label color */}
                    <div className="flex flex-col items-center space-y-2">
                        <p className="text-sm font-medium">Label Color</p>
                        <Progress
                            type="radial"
                            value={progress3}
                            showLabel
                            labelColor="#7c3aed"
                            labelPosition="follow"
                        />
                    </div>

                    {/* Radial with custom text threshold */}
                    <div className="flex flex-col items-center space-y-2">
                        <p className="text-sm font-medium">Threshold Text Colors</p>
                        <Progress
                            type="radial"
                            value={progress2}
                            showLabel
                            colorThresholds={[
                                { percentage: 0, color: '#ef4444', textColor: '#450a0a' },
                                { percentage: 50, color: '#eab308', textColor: '#422006' },
                                { percentage: 80, color: '#22c55e', textColor: '#052e16' }
                            ]}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Edge Cases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Value exceeding max */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Value Exceeding Max (150/100)</p>
                        <Progress
                            type="linear"
                            value={150}
                            max={100}
                            showLabel
                            labelPosition="end"
                        />
                    </div>

          
                    {/* Complete state */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Completed State</p>
                        <Progress
                            type="linear"
                            value={100}
                            showLabel
                            labelPosition="end"
                            primaryColor="#22c55e"
                            secondaryColor="#bbf7d0"
                        />
                    </div>
                </CardContent>
            </Card>


        </div>
    );
};

export default ProgressExamples;

