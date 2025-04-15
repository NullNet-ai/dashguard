'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../resizable';
import type * as monaco from 'monaco-editor';
import Editor, { type OnMount } from '@monaco-editor/react';
import { Spinner } from '~/components/platform/Spinner';
import { CodeXml, Clipboard, ClipboardCheck, Eye, EyeOff, Braces, Map } from 'lucide-react';
import { cn } from "~/lib/utils";
import SelectComponent from './SelectComponent';
import ToggleItem from './ToggleItem';
import { ToggleGroup } from '../../toggle-group';

interface CodeEditorProps {
	enable_editor_tools?: boolean;
	enable_auto_height?: boolean; 
	readOnly?: boolean;
	disabled?: boolean;
  hasError?: boolean;
	minHeight: string;
	maxHeight?: string;
	editorCode?: string;
	placeholder?: string;
	onCodeChange?: (value: string) => void;
	defaultTheme?: 'vs-light' | 'vs-dark' | 'hc-black' | 'hc-light';
}

const themes = [
	{ value: 'vs-light', label: 'Light' },
	{ value: 'vs-dark', label: 'Dark' },
	{ value: 'hc-black', label: 'High Contrast Black' },
	{ value: 'hc-light', label: 'High Contrast Light' },
];

const languages = [
	{ value: 'javascript', label: 'JavaScript' },
	{ value: 'typescript', label: 'TypeScript' },
	{ value: 'python', label: 'Python' },
	{ value: 'sql', label: 'SQL' },
	{ value: 'html', label: 'HTML' },
	{ value: 'css', label: 'CSS' },
];

const fontSizes = Array.from({ length: 13 }, (_, i) => {
	const size = i + 12;
	return { value: size.toString(), label: size.toString() };
});

type Theme = 'vs-light' | 'vs-dark' | 'hc-black' | 'hc-light';
type Language = 'javascript' | 'typescript' | 'python' | 'sql' | 'html' | 'css';

export default function CodeEditor({
	onCodeChange,
	enable_editor_tools = true,
	enable_auto_height = false,
	readOnly = false,
	disabled = false,
	hasError = false,
	defaultTheme = 'vs-light',
	minHeight = '25vh',
	maxHeight = '50vh',
	placeholder = 'Type your code here...',
	editorCode = ''
}: CodeEditorProps) {
	const [theme, setTheme] = useState<Theme>(defaultTheme);
	const [language, setLanguage] = useState<Language>('html');
	const [fontSize, setFontSize] = useState<number>(14);
	const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
	const [hideEditor, setHideEditor] = useState<boolean>(false);
	const [showPreview, setShowPreviewer] = useState<boolean>(false);
	const [showMiniMap, setShowMiniMap] = useState<boolean>(false);
	const [displayTools, setDisplayTools] = useState<boolean>(enable_editor_tools);
	const [copied, setCopied] = useState<boolean>(false);
	const [contentHeight, setContentHeight] = useState<string>(`${minHeight}` || 'auto');
	const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
	const editorRef = useRef<any>(null);

	const themeClass = useMemo(() => {
		return cn(
			theme === 'vs-dark' ? 'bg-[#1e1e1e] text-neutral-300' :
			theme === 'hc-black' ? 'bg-black text-white' :
			theme === 'hc-light' ? 'bg-white text-black' :
			'bg-white text-black'
		);
	}, [theme]);

	useEffect(() => {
		if (!displayTools) {
			setIsReadOnly(true);
		}
	}, [displayTools]);

	const handleCodeChange = useCallback((value: string | undefined) => {
    onCodeChange?.(value || '');
}, [onCodeChange]);

	const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
		editorRef.current = editor;
		setIsEditorReady(true);

		setTimeout(() => {
			editor.getAction("editor.action.formatDocument")?.run();
		}, 100);

		editor.onDidChangeModelContent(() => {
			updateEditorHeight(editor, monaco);
		});

		updateEditorHeight(editor, monaco);
	}, []);
	
	const parseHeight = (height: string) => {
			if (height.endsWith('px')) {
				return parseFloat(height);
			} else if (height.endsWith('vh')) {
				return (parseFloat(height) * window.innerHeight) / 100;
			}
			return parseFloat(height);
	};
	
	const updateEditorHeight = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
			const lineCount = editor.getModel()?.getLineCount() || 1;
			const lineHeight = editor.getOption(monacoInstance.editor.EditorOption.lineHeight);
			const padding = 20;
	
			const minHeightValue = parseHeight(minHeight);
			const maxHeightValue = enable_auto_height && maxHeight ? parseHeight(maxHeight) : undefined;
	
			let height = Math.max(lineCount * lineHeight + padding, minHeightValue);
	
			if (enable_auto_height && maxHeightValue) {
					height = Math.min(height, maxHeightValue);
			}
	
			const heightInVh = enable_auto_height && maxHeightValue ? `${(height / window.innerHeight) * 100}vh` : `${minHeight}`;
	
			setContentHeight(heightInVh);
	};

	const handleThemeChange = useCallback((value: string) => {
		setTheme(value as Theme);
	}, []);

	const handleLanguageChange = useCallback((value: string) => {
		setLanguage(value as Language);
	}, []);
	
	const handleFontSizeChange = useCallback((value: string) => {
		setFontSize(parseInt(value, 10));
	}, []);

	const handleHideEditor = useCallback(() => {
		setHideEditor((prev) => !prev);
		setShowPreviewer(false);
	}, []);

	const handleShowPreview = useCallback(() => {
		if (hideEditor) {
			setHideEditor(false);
			setShowPreviewer(false);
		} else {
			setShowPreviewer((prev) => !prev);
		}
	}, [hideEditor]);

	const handleShowMiniMap = useCallback(() => {
		setShowMiniMap((prev) => !prev);
	}, []);

	const handleDevMode = useCallback(() => {
		setDisplayTools((prev) => !prev);
		setIsReadOnly((prev) => !prev);
		setShowPreviewer(false);
	}, []);

	const handleCopy = useCallback(async () => {
		if (!editorCode) return;
		try {
			await navigator.clipboard.writeText(editorCode);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}, [editorCode]);
	

	const editorOptions = useMemo(() => {
		const readonly = readOnly;
		return {
			acceptSuggestionOnCommitCharacter: true,
			scrollBeyondLastLine: false,
			smoothScrolling: true,
			formatOnPaste: true,
			formatOnType: true,
			codeLens: true,
			padding: { top: 16, bottom: 16 },
			readOnly: readonly ? true : isReadOnly,
			fontSize: fontSize,
			suggest: {
				showFields: false,
				showFunctions: false
			},
			bracketPairColorization: {
				enabled: true
			},
			minimap: {
				enabled: !readonly && !isReadOnly && showMiniMap,
				scale: 3,
			}
		};
	}, [readOnly, fontSize, showMiniMap, isReadOnly]);

	return (
		<div 
			tabIndex={0}
			role="region" 
			aria-label="Code Editor" 
			className={cn(
				themeClass,
				"relative border overflow-hidden rounded-lg w-full ring-offset-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0",
				disabled ? "pointer-events-none cursor-not-allowed" : "",
				hasError ? "border-destructive": "border-input "
			)}>
			{disabled && <div className="absolute z-50 top-0 opacity-40 bg-secondary w-full h-full"></div>}
			<div className={cn(
				'flex gap-2 justify-between p-2',
				themeClass,
				readOnly || isReadOnly ? 'absolute z-10 right-0' : ''
			)}>
				{!readOnly && !isReadOnly &&
					<div className={cn(
						themeClass,
						'flex flex-wrap gap-2 sm:w-full'
					)}>
						<SelectComponent
							options={languages}
							value={language}
							onValueChange={handleLanguageChange}
							placeholder="Language"
							ariaLabel="Select Programming language"
							themeClass={themeClass}
							className="w-full sm:w-max"
						/>
						<div className="flex w-full gap-2 sm:w-max">
							<SelectComponent
								options={themes}
								value={theme}
								onValueChange={handleThemeChange}
								placeholder="Theme"
								ariaLabel="Select Editor Theme"
								themeClass={themeClass}
								className="w-[65%] sm:w-max"
							/>
							<SelectComponent
								options={fontSizes}
								value={fontSize.toString()}
								onValueChange={handleFontSizeChange}
								placeholder="Font Size"
								ariaLabel="Select Font Size"
								themeClass={themeClass}
								className="w-[35%] sm:w-max"
							/>
						</div>
						<ToggleGroup type="multiple" variant="outline" size="sm" className="flex flex-wrap gap-2 justify-start">
							<ToggleItem
								value="editorDisplay"
								tooltip="Show/Hide Editor"
								ariaLabel={hideEditor ? 'Hide code editor' : 'Show code editor'}
								ariaPressed={hideEditor}
								onClick={handleHideEditor}
								themeClass={themeClass}
								className={hideEditor ? '' : '!text-blue-500'}>
								<Braces size={14} />
							</ToggleItem>
							<ToggleItem
								value="showPreview"
								tooltip="Show/Hide Preview"
								ariaLabel={showPreview ? 'Show code preview' : 'Hide code preview'}
								ariaPressed={showPreview}
								onClick={handleShowPreview}
								themeClass={themeClass}
								className={showPreview ? '!text-blue-500' : ''}>
								{!showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
							</ToggleItem>
							<ToggleItem
								value="minimapDisplay"
								tooltip="Show/Hide Minimap"
								ariaLabel={showPreview ? 'Show editor minimap' : 'Hide editor minimap'}
								ariaPressed={showMiniMap}
								onClick={handleShowMiniMap}
								themeClass={themeClass}
								className={showMiniMap ? '!text-blue-500' : ''}>
								<Map size={14} />
							</ToggleItem>
							<div className="sm:hidden">
								<ToggleItem
									value="devMode"
									tooltip="Toggle Developer/Read-only Mode"
									ariaLabel={displayTools ? 'Show developer mode view' : 'Show read-only mode view'}
									ariaPressed={displayTools}
									onClick={handleDevMode}
									themeClass={themeClass}
									className={displayTools ? '!text-blue-500' : ''}>
									<CodeXml size={14} />
								</ToggleItem>
							</div>
							<div className="sm:hidden">
								<ToggleItem
									value="copyClipboard"
									tooltip="Copy to clipboard"
									ariaLabel={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
									ariaPressed={copied}
									ariaLive="polite"
									onClick={handleCopy}
									themeClass={themeClass}
									className={copied ? '!text-blue-500' : ''}>
									{copied ? (
											<span className="text-sm"><ClipboardCheck size={14} />{copied && 'Copied!'}</span>
									) : (
										<Clipboard size={14} />
									)}
								</ToggleItem>
							</div>
						</ToggleGroup>
					</div>
				}
				<ToggleGroup 
					type="multiple" 
					variant="outline" 
					size="sm" 
					className={cn(
						"gap-2 mr-auto h-max sm:mr-0", 
						!isReadOnly && !readOnly && "hidden sm:flex"
					)}
				>
					{!readOnly && enable_editor_tools &&
						<ToggleItem
							value="devMode"
							tooltip="Toggle Developer/Read-only Mode"
							ariaLabel={displayTools ? 'Show developer mode view' : 'Show read-only mode view'}
							ariaPressed={displayTools}
							onClick={handleDevMode}
							themeClass={themeClass}
							className={displayTools ? '!text-blue-500' : ''}>
							<CodeXml size={14} />
						</ToggleItem>
					}
					<ToggleItem
						value="copyClipboard"
						tooltip="Copy to clipboard"
						ariaLabel={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
						ariaPressed={copied}
						ariaLive="polite"
						onClick={handleCopy}
						themeClass={themeClass}
						className={copied ? '!text-blue-500' : ''}>
						{copied ? (
								<span className="text-sm"><ClipboardCheck size={14} />{copied && 'Copied!'}</span>
						) : (
							<Clipboard size={14} />
						)}
					</ToggleItem>
				</ToggleGroup>
			</div>
			<ResizablePanelGroup
				direction="horizontal"
				aria-orientation="horizontal"
  			aria-label="Code editor and preview resizable panel"
			>
				{!hideEditor && (
					<ResizablePanel defaultSize={50}>
						<Editor
							aria-label="Code Editor"
							className={maxHeight ? `max-h-[${maxHeight}]` : `max-h-[${minHeight}]`}
							height={contentHeight}
							value={editorCode}
							theme={theme}
							language={language}
							onChange={handleCodeChange}
							onMount={handleEditorDidMount}
							options={{
								...editorOptions,
								wordWrap: 'on',
								autoIndent: 'advanced',
								cursorSmoothCaretAnimation: "explicit",
								lineNumbers: readOnly ? "off" : isReadOnly ? "off" : "on",
								accessibilitySupport: 'on',
								acceptSuggestionOnEnter: 'smart',
								renderLineHighlight: readOnly ? "none" : isReadOnly ? "none" : "all",
								placeholder: isReadOnly || readOnly ? '' : placeholder,
								tabSize: 2,
								scrollbar: {
									vertical: 'visible',
									horizontal: 'visible',
								}
							}}
							loading={
								<div className="flex w-full h-full items-center justify-center bg-transparent">
									<Spinner />
								</div>
							}
						/>
					</ResizablePanel>
				)}
				{!hideEditor && showPreview && <ResizableHandle withHandle />}
				{!hideEditor && showPreview && isEditorReady && (
					<ResizablePanel defaultSize={50}>
						<div className="relative h-full w-full">
							<Editor
								className={maxHeight ? `max-h-[${maxHeight}]` : `max-h-[${minHeight}]`}
								height={contentHeight}
								language={language}
								value={editorCode}
								theme={theme}
								options={{
									fontSize: fontSize,
									readOnly: true,
									minimap: { enabled: false },
									scrollBeyondLastLine: false,
									padding: { top: 16, bottom: 16 },
									tabSize: 2,
									wordWrap: 'on',
									lineNumbers: "off",
									renderLineHighlight: "none",
									autoIndent: 'advanced',
									scrollbar: {
										vertical: 'visible',
										horizontal: 'visible',
									}
								}}
								loading={
									<div className="flex w-full h-full items-center justify-center bg-transparent">
										<Spinner />
									</div>
								}
							/>
						</div>
					</ResizablePanel>
				)}
			</ResizablePanelGroup>
		</div>
	);
}