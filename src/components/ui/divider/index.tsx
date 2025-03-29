import { cn } from "~/lib/utils";

interface DividerItem {
	content: React.ReactNode;
	position?: "left" | "center" | "right" | "top" | "bottom";
	variant?: "solid" | "dashed" | "dotted";
	positionMargin?: number;
}

interface DividerProps {
	content?: DividerItem | DividerItem[];
	variant?: "solid" | "dashed" | "dotted";
	position?: "left" | "center" | "right" | "top" | "bottom";
	className?: string;
	contentColor?: string;
	lineColor?: string;
	height?: string;
	vertical?: boolean;
	positionMargin?: number;
	children?: React.ReactNode;
}

const borderStyle = (vertical: boolean) => ({
	solid: "border-solid",
	dashed: vertical ? "border-dashed !border-t-0 !border-l-[1.5px]" : "border-dashed !border-t-[2px]",
	dotted: vertical ? "border-dotted !border-t-0 !border-l-[2px]" : "border-dotted !border-t-[3px]",
});

export function Divider({
	content,
	vertical = false,
	variant = "solid",
	height = "100px",
	position = "center",
	positionMargin = 0,
	contentColor = "white",
	lineColor = "#CBD5E1",
	className,
	children,
}: DividerProps) {

	    // Validation for invalid position when vertical is true
			if (vertical && (position === "left" || position === "right")) {
        throw new Error(
            `Invalid position "${position}" for a vertical Divider. Use "top", "center", or "bottom" instead.`
        );
    }
		
	const contentArray: DividerItem[] = Array.isArray(content) ? content : content ? [content] : [];

	const renderContent = (pos: string) => (
		contentArray
			.filter((item) => item.position === pos)
			.map((item, index) => (
				<div
					key={index}
					className="px-1"
					style={{
						backgroundColor: contentColor || "white",
						marginLeft: item.position === "left" ? item.positionMargin : undefined,
						marginRight: item.position === "right" ? item.positionMargin : undefined,
						marginTop: item.position === "top" ? item.positionMargin : undefined,
						marginBottom: item.position === "bottom" ? item.positionMargin : undefined,
					}}
				>
					{item.content}
				</div>
			))
	);

	return (
		<div className="my-4 flex items-center justify-center">
			<div
				className={cn(
					"relative flex",
					vertical ? "flex-col h-auto w-fit items-center" : "w-full items-center",
					className
				)}
				style={vertical ? { height } : {}}
			>
				<div
					className={cn(
						"absolute border-border",
						borderStyle(vertical)[variant],
						vertical
							? "h-full w-0 border-l left-1/2 -translate-x-1/2"
							: "w-full border-t top-1/2 -translate-y-1/2"
					)}
					style={{ borderColor: lineColor || "#CBD5E1" }}
					role="separator"
    			aria-orientation={vertical ? "vertical" : "horizontal"}
				/>
				{children ? (
					<div
						className={cn(
							"relative flex",
							vertical ? "flex-col h-full justify-between" : "w-full",
							position === "left" || position === "top" ? "justify-start" :
								position === "right" || position === "bottom" ? "justify-end" :
									"justify-center"
						)}
						style={{
							[vertical ? "marginTop" : "marginLeft"]: position !== "center" ? positionMargin || 0 : 0,
						}}
					>
						<div className="bg-white p-1" style={{ backgroundColor: contentColor || "white" }}>
							{children}
						</div>
					</div>
				) : (
					<div className={cn("relative flex", vertical ? "flex-col h-full w-full" : "w-full items-center justify-between")}>
						{(vertical ? ["top", "center", "bottom"] : ["left", "center", "right"]).map((pos) => (
							<div key={pos} className={cn(
								"flex items-center space-x-2",
								vertical ? (pos === "top" ? "self-center" : pos === "bottom" ? "self-center" : "flex-1 justify-center") : undefined
							)}>
								{renderContent(pos)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}