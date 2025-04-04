'use client';
import { useState } from 'react';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
} from '~/components/ui/alert-dialog';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { cn } from '~/lib/utils';
import { Spinner } from '~/components/platform/Spinner';
import { Button } from '../button';
import { Skeleton } from '../skeleton';

interface ModalProps {
	className?: string;
	position?: 'top' | 'center' | 'bottom';
	children?: React.ReactNode;
	footer?: React.ReactNode;
	footerStyle?: string;
	footerPosition?: 'left' | 'center' | 'right';
	showCloseBtn?: boolean;
	maxWidth?: string;
	contentLoading?: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAction?: () => Promise<void>;
	actions?: Array<{
		label: string;
		onClick: () => void | Promise<void>;
		disabled?: boolean;
		className?: string;
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'link';
		closeOnAction?: boolean;
	}>;
}

export default function Modal({
	children,
	showCloseBtn = true,
	footer,
	actions,
	footerPosition = 'right',
	onAction,
	maxWidth = '600px',
	position = 'center',
	footerStyle,
	contentLoading = false,
	className,
	open,
	onOpenChange,
}: ModalProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleActionClick = async (action: () => void | Promise<void>, closeOnAction = true) => {
		setIsLoading(true);
		try {
			await action();
			if (closeOnAction) {
				onOpenChange(false);
			}
		} catch (error) {
			console.error('Action failed:', error);
			
		} finally {
			setIsLoading(false);
		}
	};

	const footerAlignment = {
		left: 'flex-start',
		center: 'center',
		right: 'flex-end',
	}[footerPosition];

	const modalStyle = {
		maxWidth,
		...(position === 'top' && { top: '10%' }),
		...(position === 'bottom' && { top: '90%' }),
	};

	return (
		<AlertDialog open={open} onOpenChange={(open) => !isLoading && onOpenChange(open)}>
			<AlertDialogContent className={className} style={modalStyle}>
				{!contentLoading ? (
					<>
						{showCloseBtn && (
							<AlertDialogCancel
								className="absolute top-1 right-0 p-2 text-gray-500 hover:text-gray-700 mt-0 !bg-transparent border-none"
								aria-label="Close"
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
							>
								<XMarkIcon className="size-7" />
							</AlertDialogCancel>
						)}
						{children}
						{footer || (
							<AlertDialogFooter className={cn('flex !gap-3', footerStyle)} style={{ justifyContent: footerAlignment }}>
								{actions ? (
									actions.map((action, index) => (
										<Button
											key={index}
											onClick={action.onClick ? () => handleActionClick(action.onClick, action.closeOnAction ?? true) : undefined}
											disabled={action.disabled || isLoading}
											variant={action.variant || 'default'}
											className={cn(
												'flex items-center justify-center !mx-0',
												action.className,
												isLoading && 'opacity-50 cursor-not-allowed'
											)}
										>
											<span className="flex items-center gap-2">
												{isLoading && <Spinner />}
												{action.label}
											</span>
										</Button>
									))
								) : (
									<>
										<AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isLoading}>
											Cancel
										</AlertDialogCancel>
										<Button
											onClick={onAction ? () => handleActionClick(onAction) : undefined}
											disabled={isLoading}
											className={cn(
												'flex items-center justify-center',
												isLoading && 'opacity-50 cursor-not-allowed'
											)}
										>
											<span className="flex items-center gap-2">
												{isLoading && <Spinner />}
												Confirm
											</span>
										</Button>
									</>
								)}
							</AlertDialogFooter>
						)}
					</>
				) : (
					<Skeleton className="w-full h-36 bg-slate-200" />
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
}