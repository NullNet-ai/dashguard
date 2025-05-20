import { ToggleGroupItem } from '../../toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../tooltip';
import { cn } from '~/lib/utils';

interface ToggleGroupItemProps {
	value: string;
	ariaLabel: string;
	ariaLive?: 'polite' | 'assertive';
	ariaPressed: boolean;
	onClick: () => void;
	className?: string;
	tooltip: string;
	children: React.ReactNode;
	themeClass?: string;
}

export default function ToggleItem({ value, onClick, className, themeClass, ariaLabel, ariaLive, ariaPressed, tooltip, children, }: ToggleGroupItemProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<ToggleGroupItem
						value={value}
						aria-label={ariaLabel}
						aria-live={ariaLive}
						aria-pressed={ariaPressed}
						onClick={onClick}
						className={cn(
							className,
							themeClass,
							'flex items-center gap-1 !bg-transparent rounded transition-all cursor-pointer ring-offset-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 hover:!bg-gray-600/20 hover:!text-blue-500 '
						)}
						asChild
					>
						{children}
					</ToggleGroupItem>
				</TooltipTrigger>
				<TooltipContent>
					<p>{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}