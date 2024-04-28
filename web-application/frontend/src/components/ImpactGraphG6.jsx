// import './styles.css';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import FilterComponent from './FilterComponent';
import ImpactLegend from './ImpactLegend';
import CustomTooltip from './custom/CustomTooltip';
import Loading from './Loading';

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

import G6 from '@antv/g6';
import { Rect, Group, Text, createNodeFromReact, appenAutoShapeListener } from '@antv/g6-react-node';
import insertCss from 'insert-css';

import backendClient from '../config/axiosConfig';

insertCss(`
  .g6-minimap-container {
    border: 1px solid #e2e2e2;
  }
  .g6-minimap-viewport {
    border: 2px solid rgb(25, 128, 255);
  }
  .g6-component-tooltip {
    border: 1px solid #e2e2e2;
    border-radius: 4px;
    font-size: 12px;
    color: #000;
    background-color: rgba(255, 255, 255, 1);
    padding: 10px 8px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
  }
`);

const fittingString = (str, maxWidth, fontSize) => {
	const ellipsis = '...';
	const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0];
	let currentWidth = 0;
	let res = str;
	const pattern = new RegExp('[\u4E00-\u9FA5]+'); // distinguish the Chinese charactors and letters
	str.split('').forEach((letter, i) => {
		if (currentWidth > maxWidth - ellipsisLength) return;
		if (pattern.test(letter)) {
			// Chinese charactors
			currentWidth += fontSize;
		} else {
			// get the width of single letter according to the fontSize
			currentWidth += G6.Util.getLetterWidth(letter, fontSize);
		}
		if (currentWidth > maxWidth - ellipsisLength) {
			res = `${str.substr(0, i)}${ellipsis}`;
		}
	});
	return res;
};

const Card = ({ cfg }) => {
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

	return (
		<Group>
			<Rect>
				<Rect
					style={{
						width: 160,
						height: 20,
						fill,
						stroke,
						shadowColor: '#eee',
						shadowBlur: 30,
						radius: [8, 8, 0, 0],
						justifyContent: 'center',
						cursor: 'move',
					}}
					draggable='true'
				>
					<Text
						style={{
							margin: [4, 5],
							fontWeight: 'bold',
							fill: '#fff',
							fontSize: 16,
							justifyContent: 'center',
							cursor: 'move',
						}}
						draggable='true'
					>
						{fittingString(className, 150, 16)}
					</Text>
				</Rect>
				<Rect
					style={{
						width: 160,
						height: 30,
						stroke,
						fill: '#ffffff',
						radius: [0, 0, 8, 8],
						cursor: 'move',
					}}
					draggable='true'
				>
					<Text style={{ marginTop: 5, fill: '#333', margin: [8, 4], cursor: 'move' }} draggable='true'>
						{fittingString(functionName, 160, 12)}
					</Text>
				</Rect>
			</Rect>
		</Group>
	);
};
G6.registerNode('rect-xml2', createNodeFromReact(Card));

export default function ImpactGraphG6() {
	const ref = useRef(null);
	let graph = null;
	const { repoID, prNumber } = useParams();

	const [isLoading, setIsLoading] = useState(false);
	const [elements, setElements] = useState({ nodes: [], edges: [] });
	const [initialNodes, setInitialNodes] = useState([]);
	const [initialEdges, setInitialEdges] = useState([]);
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
			setIsLoading(true);
			const response = await backendClient.get(
				`/api/impact/repositories/${repoID}/pullRequests/${prNumber}?impactLevel=${filterValues.impactLevel}`
			);
			const { updatedNodes: initialNodes, updatedEdges: initialEdges, fileNames: fNames } = response.data;
			setInitialNodes(initialNodes);
			setInitialEdges(initialEdges);
			setFileNames(fNames);
			setFilterValues({ ...filterValues, selectedValues: fNames });
			setIsLoading(false);
		};

		fetchData();
	}, [repoID, prNumber, filterValues.impactLevel]);

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
		}));

		const edges = initialEdges.map((edge) => ({
			source: edge.source,
			target: edge.target,
		}));

		setElements({ nodes, edges });
	}, [initialNodes, initialEdges]);

	useEffect(() => {
		if (!isLoading) {
			if (!graph) {
				const tooltip = new G6.Tooltip({
					offsetX: 0,
					offsetY: 40,
					fixToNode: [0, 0],
					itemTypes: ['node'],
					getContent: (e) => {
						const outDiv = document.createElement('div');
						outDiv.style.width = 'fit-content';
						outDiv.style.padding = '10px';
						outDiv.style.backgroundColor = '#fff';
						outDiv.style.borderRadius = '5px';
						// outDiv.style.color = '#333';
						outDiv.style.fontSize = '14px';

						let {
							color,
							simplifiedSignature,
							packageName,
							className,
							filePath,
							projectIdentifier,
							destinationBranchName,
						} = e.item.getModel();

						let nodeType;
						let borderColor = color;
						if (color === '#ADD8E6') {
							nodeType = 'Possibly Affected';
						} else if (color === '#FFA500') {
							nodeType = 'Modified';
						} else if (color === '#FF6961') {
							nodeType = 'Removed';
						} else if (color === '#FFA500 #ADD8E6') {
							nodeType = 'Modified & Possibly Affected';
							borderColor = '#FFA500';
							outDiv.style.outline = '3px solid #ADD8E6';
						}

						outDiv.style.border = '3px solid ' + borderColor;

						let title;
						if (nodeType === 'Modified & Possibly Affected') {
							title = `
							<h4 style="margin: 0; background: linear-gradient(to right, #FFA500 0%, #ADD8E6 60%); -webkit-background-clip: text;
							-webkit-text-fill-color: transparent;">${nodeType.toUpperCase()}</h4>
						`;
						} else {
							title = `
							<h4 style="margin: 0; color: ${color}">${nodeType.toUpperCase()}</h4>
						`;
						}

						outDiv.innerHTML =
							title +
							`
							<div><b>Class Name: </b>${className}.java</div>
							<div><b>Package Name: </b>${packageName} </div>
							<div><b>Signature: </b>${simplifiedSignature}</div>
							<div><b>File Path: </b>${filePath}</div>
						`;

						return outDiv;
					},
				});

				const minimap = new G6.Minimap({
					size: [150, 100],
				});

				const toolbar = new G6.ToolBar({
					position: { x: 300, y: 100 },
				});
				//实例化 Graph
				graph = new G6.Graph({
					container: ref.current,
					width: 1500,
					height: 900,
					fitView: true,
					modes: {
						default: [
							'drag-node',
							{ type: 'drag-canvas' },
							{ type: 'zoom-canvas' },
							// {
							// 	type: 'tooltip',
							// 	formatText: function formatText(model) {
							// 		const text = 'description: ';
							// 		return text;
							// 	},
							// },
						],
					},
					plugins: [tooltip],
					layout: {
						type: 'dagre',
						// rankdir: "TB", // 可选，默认为图的中心
						// align: 'DL', // 可选
						nodesep: 50, // 可选
						ranksep: 75, // 可选
						// controlPoints: true
					},
					defaultNode: {
						type: 'rect-xml2',
					},
					defaultEdge: {
						type: 'quadratic',
						style: {
							stroke: '#AEAEAE',
							lineWidth: 3,
							endArrow: {
								path: G6.Arrow.triangle(4, 4, 8),
								d: 8,
							},
						},
						edgeStateStyles: {
							highlight: {
								stroke: '#ffb203',
								lineWidth: 5,
							},
							dark: {
								stroke: '#ffb20333',
							},
						},

						// curveOffset: 100
						// controlPoints: [{ x: 10, y: 20 }]
					},
				});
			}

			const graphContainer = document.querySelector('.graph-container');
			graphContainer.style.backgroundImage =
				'radial-gradient(#00000030 1px, transparent 1px), radial-gradient(#00000030 1px, transparent 1px)';
			graphContainer.style.backgroundSize = '20px 20px';
			graphContainer.style.backgroundPosition = '0 0, 10px 10px';
			graphContainer.style.backgroundRepeat = 'repeat';

			appenAutoShapeListener(graph);
			graph.data(elements);
			graph.render();

			function clearAllStats() {
				graph.setAutoPaint(false);
				graph.getNodes().forEach(function (node) {
					graph.clearItemStates(node);
				});
				graph.getEdges().forEach(function (edge) {
					graph.clearItemStates(edge);
				});
				graph.paint();
				graph.setAutoPaint(true);
			}

			graph.on('node:click', function (e) {
				const item = e.item;

				clearAllStats(); // clear all states before highlighting

				graph.setAutoPaint(false);
				graph.setItemState(item, 'dark', false);
				graph.setItemState(item, 'highlight', true);
				graph.getEdges().forEach(function (edge) {
					if (edge.getSource() === item) {
						graph.setItemState(edge.getTarget(), 'dark', false);
						graph.setItemState(edge.getTarget(), 'highlight', true);
						graph.setItemState(edge, 'highlight', true);
						edge.toFront();
					}
				});
				graph.paint();
				graph.setAutoPaint(true);
			});

			graph.on('canvas:click', clearAllStats);
		}

		return () => {
			if (graph) {
				graph.destroy();
				graph = null;
			}
		};
	}, [elements]);

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
		if (elements.edges.length > 0 && initialNodes) {
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
				type: 'rect-xml2',
			}));

			setElements({ nodes: n, edges: elements.edges });
		}
	}, [filterValues]);

	return (
		<Box sx={{ height: 600, width: '100%' }}>
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
			<div style={{ width: '100%', height: '100%' }} className='graph-container'>
				{isLoading ? <Loading /> : <div ref={ref}></div>}
			</div>
		</Box>
	);
}
