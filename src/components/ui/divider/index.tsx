import { cn } from "~/lib/utils";

interface DividerItem {
	content: React.ReactNode;
	position?: "left" | "center" | "right" | "top" | "bottom";
	variant?: "solid" | "dashed" | "dotted" | "outlined";
	positionMargin?: number;
}

interface DividerProps {
	content?: DividerItem | DividerItem[];
	variant?: "solid" | "dashed" | "dotted" | "outlined";
	position?: "left" | "center" | "right" | "top" | "bottom";
	className?: string;
	contentColor?: string;
	height?: string;
	vertical?: boolean;
	positionMargin?: number;
	children?: React.ReactNode;
}

export function Divider({
	content,
	vertical = false,
	variant = "solid",
	height = "100px",
	position = "center",
	positionMargin = 0,
	contentColor = "white",
	className,
	children,
}: DividerProps) {
	const contentArray: DividerItem[] = content ? (Array.isArray(content) ? content : [content]) : [];

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
						`absolute border-${variant} border-border`,
						vertical
							? "h-full w-0 border-l left-1/2 -translate-x-1/2"
							: "w-full border-t top-1/2 -translate-y-1/2",
						variant === "dotted" && "border-t-[3px]",
						variant === "dashed" && "border-t-[2px]"
					)}
				/>
				{/* children */}
				{children ? (
					<div
						className={cn(
							"relative flex",
							vertical ? "flex-col h-full justify-between" : "w-full",
							position === "left" || position === "top"
								? "justify-start"
								: position === "right" || position === "bottom"
									? "justify-end"
									: "justify-center"
						)}
						style={{
							[vertical ? "marginTop" : "marginLeft"]: position !== "center" ? positionMargin : 0,
						}}
					>
						<div className="bg-white p-1" style={{ backgroundColor: contentColor }}>{children}</div>
					</div>
				) : (
					<div className={cn("relative flex", vertical ? "flex-col h-full items-center justify-between" : "w-full items-center justify-between")}>
						{vertical
							? ["top", "center", "bottom"].map((pos) => ( //vertical orientation
								<div
									key={pos}
									className={cn(
										"flex flex-col items-center space-y-2 w-full",
										pos === "top" ? "self-start" : pos === "bottom" ? "self-end" : "flex-1 justify-center"
									)}
								>
									{contentArray
										.filter((item) => item.position === pos)
										.map((item, index) => (
											<div
												key={index}
												style={{
													backgroundColor: contentColor,
													marginTop: item.position === "top" ? item.positionMargin : undefined,
													marginBottom: item.position === "bottom" ? item.positionMargin : undefined,
												}}
											>
												{item.content}
											</div>
										))}
								</div>
							))
							: ["left", "center", "right"].map((pos) => ( //horizontal orientation
								<div key={pos} className="flex items-center space-x-2">
									{contentArray
										.filter((item) => item.position === pos)
										.map((item, index) => (
											<div
												key={index}
												className="px-1"
												style={{
													backgroundColor: contentColor,
													marginLeft: item.position === "left" ? item.positionMargin : undefined,
													marginRight: item.position === "right" ? item.positionMargin : undefined,
												}}
											>
												{item.content}
											</div>
										))}
								</div>
							))}
					</div>
				)}
			</div>
		</div>
	);
}
