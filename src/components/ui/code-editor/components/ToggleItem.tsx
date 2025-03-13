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
}

export default function ToggleItem({ value, onClick, className, ariaLabel, ariaLive, ariaPressed, tooltip, children, }: ToggleGroupItemProps) {
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
							'cursor-pointer'
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