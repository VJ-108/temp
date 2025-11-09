import React, { useState } from "react";
import {
	ChevronRight,
	ChevronDown,
	File,
	Folder,
	FolderOpen,
	FileText,
	RefreshCw,
	Plus,
	Trash2,
	Edit3,
} from "lucide-react";

const getFileIcon = (fileName) => {
	const ext = fileName.split(".").pop()?.toLowerCase();

	const colors = {
		js: "#f7df1e",
		jsx: "#61dafb",
		ts: "#3178c6",
		tsx: "#3178c6",
		json: "#5ba02c",
		html: "#e34c26",
		css: "#563d7c",
		md: "#083fa1",
		txt: "#6b7280",
		py: "#3776ab",
	};

	return <File size={16} style={{ color: colors[ext] || "#6b7280" }} />;
};

const FileTreeNode = ({
	fileName,
	nodes,
	path,
	onSelect,
	onAdd,
	onDelete,
	onRename,
	selectedPath,
	level = 0,
}) => {
	const [isOpen, setIsOpen] = useState(true);
	const [showMenu, setShowMenu] = useState(false);
	const isDir = !!nodes;
	const isSelected = selectedPath === path;

	const handleClick = (e) => {
		e.stopPropagation();
		if (isDir) {
			setIsOpen(!isOpen);
		} else {
			onSelect(path);
		}
	};

	const handleContextMenu = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setShowMenu(!showMenu);
	};

	const handleAction = (action) => {
		setShowMenu(false);
		switch (action) {
			case "addFile":
				onAdd(path, "file");
				break;
			case "addFolder":
				onAdd(path, "folder");
				break;
			case "rename":
				onRename(path);
				break;
			case "delete":
				onDelete(path);
				break;
			default:
				break;
		}
	};

	return (
		<div style={{ position: "relative" }}>
			<div
				onClick={handleClick}
				onContextMenu={handleContextMenu}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "6px",
					padding: "3px 8px",
					paddingLeft: `${level * 16 + 8}px`,
					cursor: "pointer",
					fontSize: "13px",
					backgroundColor: isSelected ? "#37373d" : "transparent",
					color: "#cccccc",
					transition: "background-color 0.1s",
				}}
				onMouseEnter={(e) => {
					if (!isSelected) e.currentTarget.style.backgroundColor = "#2a2d2e";
				}}
				onMouseLeave={(e) => {
					if (!isSelected)
						e.currentTarget.style.backgroundColor = "transparent";
				}}
			>
				{isDir ? (
					<>
						{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
						{isOpen ? (
							<FolderOpen size={16} style={{ color: "#dcb67a" }} />
						) : (
							<Folder size={16} style={{ color: "#dcb67a" }} />
						)}
					</>
				) : (
					<>
						<span style={{ width: "14px" }} />
						{getFileIcon(fileName)}
					</>
				)}
				<span
					style={{
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{fileName}
				</span>
			</div>

			{showMenu && (
				<>
					<div
						style={{
							position: "fixed",
							inset: 0,
							zIndex: 40,
						}}
						onClick={() => setShowMenu(false)}
					/>
					<div
						style={{
							position: "absolute",
							right: "8px",
							top: "100%",
							backgroundColor: "#3c3c3c",
							border: "1px solid #454545",
							borderRadius: "4px",
							boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
							zIndex: 50,
							minWidth: "180px",
							padding: "4px 0",
							fontSize: "13px",
						}}
					>
						{isDir && (
							<>
								<button
									onClick={() => handleAction("addFile")}
									style={{
										width: "100%",
										padding: "6px 12px",
										textAlign: "left",
										backgroundColor: "transparent",
										border: "none",
										color: "#cccccc",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: "8px",
									}}
									onMouseEnter={(e) =>
										(e.currentTarget.style.backgroundColor = "#2a2d2e")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.backgroundColor = "transparent")
									}
								>
									<Plus size={14} /> New File
								</button>
								<button
									onClick={() => handleAction("addFolder")}
									style={{
										width: "100%",
										padding: "6px 12px",
										textAlign: "left",
										backgroundColor: "transparent",
										border: "none",
										color: "#cccccc",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: "8px",
									}}
									onMouseEnter={(e) =>
										(e.currentTarget.style.backgroundColor = "#2a2d2e")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.backgroundColor = "transparent")
									}
								>
									<Plus size={14} /> New Folder
								</button>
								<div
									style={{
										height: "1px",
										backgroundColor: "#454545",
										margin: "4px 0",
									}}
								/>
							</>
						)}
						<button
							onClick={() => handleAction("rename")}
							style={{
								width: "100%",
								padding: "6px 12px",
								textAlign: "left",
								backgroundColor: "transparent",
								border: "none",
								color: "#cccccc",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.backgroundColor = "#2a2d2e")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.backgroundColor = "transparent")
							}
						>
							<Edit3 size={14} /> Rename
						</button>
						<button
							onClick={() => handleAction("delete")}
							style={{
								width: "100%",
								padding: "6px 12px",
								textAlign: "left",
								backgroundColor: "transparent",
								border: "none",
								color: "#f48771",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.backgroundColor = "#2a2d2e")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.backgroundColor = "transparent")
							}
						>
							<Trash2 size={14} /> Delete
						</button>
					</div>
				</>
			)}

			{isDir && isOpen && nodes && (
				<div>
					{Object.keys(nodes)
						.sort()
						.map((child) => (
							<FileTreeNode
								key={child}
								fileName={child}
								nodes={nodes[child]}
								path={path ? `${path}/${child}` : child}
								onSelect={onSelect}
								onAdd={onAdd}
								onDelete={onDelete}
								onRename={onRename}
								selectedPath={selectedPath}
								level={level + 1}
							/>
						))}
				</div>
			)}
		</div>
	);
};

const FileTree = ({
	tree,
	onSelect,
	onAdd,
	onDelete,
	onRename,
	selectedPath,
	onRefresh,
}) => {
	return (
		<div
			style={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#252526",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "8px 12px",
					borderBottom: "1px solid #2d2d30",
					fontSize: "11px",
					fontWeight: 600,
					textTransform: "uppercase",
					letterSpacing: "0.5px",
					color: "#cccccc",
				}}
			>
				<span>Explorer</span>
				<button
					onClick={onRefresh}
					style={{
						background: "none",
						border: "none",
						color: "#cccccc",
						cursor: "pointer",
						padding: "2px",
						display: "flex",
						alignItems: "center",
						opacity: 0.7,
					}}
					onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
					onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
					title="Refresh Explorer"
				>
					<RefreshCw size={14} />
				</button>
			</div>
			<div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
				{Object.keys(tree).length === 0 ? (
					<div
						style={{
							padding: "16px",
							fontSize: "12px",
							color: "#858585",
							textAlign: "center",
						}}
					>
						No files yet
					</div>
				) : (
					<FileTreeNode
						fileName="workspace"
						path=""
						nodes={tree}
						onSelect={onSelect}
						onAdd={onAdd}
						onDelete={onDelete}
						onRename={onRename}
						selectedPath={selectedPath}
					/>
				)}
			</div>
		</div>
	);
};

export default FileTree;
