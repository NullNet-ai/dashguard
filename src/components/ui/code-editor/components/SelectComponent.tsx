import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../select';
import { cn } from "~/lib/utils";

interface SelectOption {
	value: string;
	label: string;
}

interface SelectComponentProps {
	options: SelectOption[];
	value: string;
	onValueChange: (value: string) => void;
	placeholder: string;
	themeClass: string;
	className?: string;
	ariaLabel: string;
}

export default function SelectComponent({ options, value, onValueChange, placeholder, ariaLabel, themeClass, className }: SelectComponentProps) {
	return (
		<Select onValueChange={onValueChange} value={value}>
			<SelectTrigger className={cn(
				'h-9 text-sm gap-1 sm:text-[14px]',
				className,
				themeClass
			)}>
				<SelectValue aria-label={ariaLabel} placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}