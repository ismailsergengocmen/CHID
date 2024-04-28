import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Graphin, { Behaviors, Components } from '@antv/graphin';
import { Group, Rect, Text, createNodeFromReact } from '@antv/g6-react-node';

import backendClient from '../config/axiosConfig';

import ImpactNodeContext from './ImpactNodeContext';
import FilterComponent from './FilterComponent';
import ImpactLegend from './ImpactLegend';
import CustomTooltip from './custom/CustomTooltip';

import {
	Divider,
	Paper,
	MenuList,
	ListItemText,
	ListItemIcon,
	Box,
	IconButton,
	Menu,
	MenuItem,
	Badge,
	Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

const { DragNode, ActivateRelations } = Behaviors;
const { Legend, MiniMap, Tooltip, ContextMenu } = Components;

const RightClickMenu = (value) => {
	const handleClick = (e) => {
		const { onClose, id } = value;

		onClose();
	};

	return (
		<Paper sx={{ width: 320, maxWidth: '100%' }} onClick={handleClick}>
			<MenuList>
				<MenuItem>
					<ListItemText>Cut</ListItemText>
				</MenuItem>
				<MenuItem>
					<ListItemText>Copy</ListItemText>
				</MenuItem>
				<MenuItem>
					<ListItemText>Paste</ListItemText>
				</MenuItem>
			</MenuList>
		</Paper>
	);
};

const CustomNode = ({ cfg = {} }) => {
	const { className, functionName, color } = cfg;
	let fill;
	let stroke;

	if (color.includes(' ')) {
		const colors = color.split(' ');
		fill = `l(0) 0:${colors[0]} 0.7:${colors[1]}`;
		stroke = fill;
	} else {
		fill = color;
		stroke = color;
	}

	const truncateText = (text, maxLength) => {
		if (text.length <= maxLength) {
			return text;
		}
		return `${text.substring(0, maxLength)}...`;
	};

	const truncatedClassName = truncateText(className, 15);
	const truncatedFunctionName = truncateText(functionName, 20);

	return (
		<Group>
			<Rect>
				<Rect
					style={{
						width: 160,
						height: 20,
						fill,
						radius: [1, 1, 0, 0],
						cursor: 'move',
						stroke,
						justifyContent: 'center',
					}}
					draggable='true'
				>
					<Text
						style={{
							margin: [4, 5],
							fontWeight: 'bold',
							fill: '#fff',
							cursor: 'move',
							justifyContent: 'center',
						}}
						draggable='true'
					>
						{truncatedClassName}
					</Text>
				</Rect>
				<Rect
					style={{
						width: 160,
						height: 30,
						stroke,
						fill: '#ffffff',
						radius: [0, 0, 1, 1],
						cursor: 'move',
					}}
					draggable='true'
				>
					<Text style={{ marginTop: 5, fill: '#333', margin: [8, 4], cursor: 'move' }} draggable='true'>
						{truncatedFunctionName}
					</Text>
				</Rect>
			</Rect>
		</Group>
	);
};

Graphin.registerNode('custom-node-one', createNodeFromReact(CustomNode));

const ImpactGraphGraphin = () => {
	const { repoID, prNumber } = useParams();

	const [elements, setElements] = useState({ nodes: [], edges: [] });
	const [initialNodes, setInitialNodes] = useState([]);
	const [initialEdges, setInitialEdges] = useState([]);
	const [nodes, setNodes] = useState([]);
	const [edges, setEdges] = useState([]);
	const [fileNames, setFileNames] = useState([]);
	const [badgeInfo, setBadgeInfo] = useState({ visible: false, value: 0 });
	const [filterValues, setFilterValues] = useState({
		selectedValues: [],
		orangeChecked: true,
		redChecked: true,
		blueChecked: true,
		impactLevel: 3,
	});

	const [anchorEl, setAnchorEl] = useState(null);

	const open = Boolean(anchorEl);

	const handleMenuClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	useEffect(() => {
		const fetchData = async () => {
			const response = await backendClient.get(
				`/api/impact/repositories/${repoID}/pullRequests/${prNumber}?impactLevel=${filterValues.impactLevel}`
			);
			const { updatedNodes: initialNodes, updatedEdges: initialEdges, fileNames: fNames } = response.data;
			setInitialNodes(initialNodes);
			setInitialEdges(initialEdges);
			setFileNames(fNames);
			setFilterValues({ ...filterValues, selectedValues: fNames });
		};

		fetchData();
	}, [repoID, prNumber, filterValues.impactLevel]);

	useEffect(() => {
		console.log('changed: ', elements);
	}, [elements]);

	useEffect(() => {
		const nodes = initialNodes.map((node) => ({
			id: node.id,
			className: node.data.className,
			functionName: node.data.functionName,
			packageName: node.data.packageName,
			simplifiedSignature: node.data.simplifiedSignature,
			filePath: node.data.filePath,
			projectIdentifier: node.data.projectIdentifier,
			destinationBranchName: node.data.destinationBranchName,
			color: node.data.nodeColor,
			type: 'custom-node-one',
		}));

		const edges = initialEdges.map((edge) => ({
			source: edge.source,
			target: edge.target,
			style: {
				keyshape: {
					stroke: '#AEAEAE',
					lineWidth: 1,
				},
			},
		}));

		setElements({ nodes, edges });
	}, [initialNodes, initialEdges]);

	useEffect(() => {
		// Update the badge info
		let changeCount = 0;
		if (!(filterValues.orangeChecked && filterValues.redChecked && filterValues.blueChecked)) {
			changeCount++;
		}
		if (filterValues.impactLevel !== 3) {
			changeCount++;
		}
		if (
			!(
				fileNames.length === filterValues.selectedValues.length &&
				fileNames.every((value, index) => value === filterValues.selectedValues[index])
			)
		) {
			changeCount++;
		}
		if (changeCount === 0) {
			setBadgeInfo({ visible: false, value: 0 });
		} else {
			setBadgeInfo({ visible: true, value: changeCount });
		}

		// Update the nodes list
		if (initialNodes) {
			const newArr = [];
			for (let i = 0; i < initialNodes.length; i++) {
				if (
					((filterValues.blueChecked && initialNodes[i].data.affected === filterValues.blueChecked) ||
						(filterValues.orangeChecked && initialNodes[i].data.changed === filterValues.orangeChecked) ||
						(filterValues.redChecked && initialNodes[i].data.deleted === filterValues.redChecked)) &&
					filterValues.selectedValues.includes(
						initialNodes[i].data.packageName + '.' + initialNodes[i].data.className
					)
				) {
					newArr.push(initialNodes[i]);
				}
			}
			const n = newArr.map((node) => ({
				id: node.id,
				className: node.data.className,
				functionName: node.data.functionName,
				packageName: node.data.packageName,
				simplifiedSignature: node.data.simplifiedSignature,
				filePath: node.data.filePath,
				projectIdentifier: node.data.projectIdentifier,
				destinationBranchName: node.data.destinationBranchName,
				color: node.data.nodeColor,
				type: 'custom-node-one',
			}));

			if (elements.edges.length > 0) {
				const edges = [
					// {
					// 	source: 'processing.app.Base.rebuildBoardsMenu()',
					// 	target: 'processing.app.Base.onIndexesUpdated()',
					// },
					// {
					// 	source: 'processing.app.Base.rebuildBoardsMenu()',
					// 	target: 'processing.app.Base.openBoardsManager(String,String)',
					// },
					// {
					// 	source: 'processing.app.Base.rebuildBoardsMenu()',
					// 	target: 'processing.app.Base.processing.app.Base.openLibraryManager(String,String)',
					// },
					// {
					// 	source: 'processing.app.Base.rebuildBoardsMenu()',
					// 	target: 'processing.app.Base.onIndexesUpdated()',
					// },
					// {
					// 	source: 'processing.app.Editor.populatePortMenu()',
					// 	target: 'processing.app.Editor.buildToolsMenu()',
					// },
					{
						source: 'processing.app.Editor.populatePortMenu()',
						target: 'processing.app.Editor.buildToolsMenu()',
					},
					// {
					// 	source: 'processing.app.Editor.buildToolsMenu()',
					// 	target: 'processing.app.Editor.buildMenuBar()',
					// },
				];
				if (changeCount === 1) {
					setElements({ nodes: n, edges });
				} else setElements({ nodes: n, edges: elements.edges });
			}
		}
	}, [filterValues]);

	return (
		<Box sx={{ height: 600, width: '90%' }}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '5px 20px',
					background: '#f8f8f8',
				}}
			>
				<div>
					<ImpactLegend
						readings={[
							{
								name: 'Modified',
								color: 'orange',
							},
							{
								name: 'Removed',
								color: '#ff6961',
							},
							{
								name: 'Possibly Affected',
								color: 'lightblue',
							},
						]}
					/>
				</div>
				<div>
					<CustomTooltip title='Filter' arrow>
						<IconButton onClick={handleMenuClick}>
							<Badge color='error' badgeContent={badgeInfo.value} invisible={!badgeInfo.visible}>
								<FilterListIcon />
							</Badge>
						</IconButton>
					</CustomTooltip>
				</div>
				<Menu open={open} anchorEl={anchorEl} onClose={handleMenuClose}>
					<MenuItem sx={{ width: 500 }}>
						<FilterComponent
							fileNames={fileNames}
							filterValues={filterValues}
							setFilterValues={setFilterValues}
						/>
					</MenuItem>
				</Menu>
			</div>
			<div style={{ width: '100%', height: '100%' }}>
				{elements.nodes.length > 0 ? (
					<Graphin width='100%' height='100%' data={elements} layout={{ type: 'dagre' }} fitView={true}>
						<DragNode />
						<ActivateRelations trigger='click' />
						<MiniMap />
						{/* <Legend bindType='node' sortKey='color'>
						{(renderProps) => {
							console.log('renderProps: ', renderProps);
							return <Legend.Node {...renderProps} />;
						}}
					</Legend> */}
						<Tooltip
							bindType='node'
							placement='bottom'
							hasArrow={false}
							style={{
								background: '#fff',
								width: '1',
								wordWrap: 'break-word',
							}}
						>
							{(value) => {
								if (value.model) {
									const { model } = value;
									return <ImpactNodeContext data={model} />;
								}
								return null;
							}}
						</Tooltip>
						<ContextMenu style={{ background: '#fff' }} bindType='node'>
							{(value) => {
								return <RightClickMenu {...value} />;
							}}
						</ContextMenu>
					</Graphin>
				) : (
					<></>
				)}
			</div>
		</Box>
	);
};

export default ImpactGraphGraphin;
