import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { localStorage } from './Utilities';
import { Link } from '@material-ui/core';


const styles = (theme) => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  avatarCell: {
    width: '40px',
  },
});

class SimpleTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { curUser: localStorage.getItem('user'), data: this.props.data, bProfilePage: this.props.bProfilePage };
    this.unfollow = this.unfollow.bind(this);
  }

  // componentDidMount() {
  //   const { data } = this.state;
  //   this.setState({ data });
  // }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.data !== this.props.data) {
  //     // this.setState({ data: this.props.data });
  //     this.render();
  //   }
  // }

  async unfollow(toUnfollowIndex) {
    const { curUser, data } = this.state;
    const { bProfilePage } = this.props;
    const unfollowed = data[toUnfollowIndex].username;
    if (bProfilePage) {
      data.splice(toUnfollowIndex, 1);
    } else {
      data[toUnfollowIndex].following = false;
    }
    this.setState({ data });


    await fetch(`http://localhost:8080/unfollow/${curUser}/${unfollowed}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
        },
        mode: 'cors',
      });
  }

  async follow(toFollowIndex) {
    const { curUser, data } = this.state;
    data[toFollowIndex].following = true;
    this.setState({ data });
    await fetch(`http://localhost:8080/follow/${curUser}/${data[toFollowIndex].username}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
        },
        mode: 'cors',
      });
  }

  render() {
    const { classes, data, bProfilePage, bLoggedInUser } = this.props;
    function getAvatar(username, profilePicture) {
      let comp = null;
      try {
        const src = require(`${profilePicture}`);
        comp = (
          <Avatar
            alt={username.charAt(0)}
            className={classes.avatar}
            // eslint-disable-next-line import/no-dynamic-require,global-require
            src={src}
            id="profile-pic"
          //onClick={this.history.push('/imageupload')}
          />
        );
      } catch (e) {
        comp = (
          <Avatar
            className={classes.avatar}
            // eslint-disable-next-line import/no-dynamic-require,global-require
            id="profile-pic"
          >
            {username.charAt(0)}
          </Avatar>
        );
      }
      return comp;
    }
    return (
      <Paper className={classes.root}>
        <Table className={classes.table} aria-label="simple table">
          <TableBody>
            {data.map((row, i) => {
              return (
                <TableRow key={row.username}>
                  <TableCell>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          {getAvatar(row.username, row.profilePicture)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText>
                        <Link href={`/profile/${row.username}`}>{row.username}</Link>
                      </ListItemText>
                    </ListItem>
                  </TableCell>
                  {bLoggedInUser && (
                    <TableCell align="right">
                      {(bProfilePage || row.following) ? (
                        <IconButton edge="end" aria-label="delete" onClick={() => this.unfollow(i)}>
                          <DeleteOutlinedIcon />
                        </IconButton>
                      )
                        : (
                          <IconButton edge="end" aria-label="add" onClick={() => this.follow(i)}>
                            <AddCircleOutlineOutlinedIcon />
                          </IconButton>
                        )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

SimpleTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string.isRequired,
      profilePicture: PropTypes.string,
      curFollowing: PropTypes.string,
    }),
  ).isRequired,
  bProfilePage: PropTypes.bool.isRequired,
  foreignUser: PropTypes.bool.isRequired,
  classes: PropTypes.shape({
    root: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    avatarCell: PropTypes.string.isRequired,
    table: PropTypes.string.isRequired,
  }).isRequired,
};

export default withStyles(styles)(SimpleTable);

// class SimpleTable extends React.Component {
//   // constructor(props) {
//   //   super(props);
//   //   this.state = { data: props.followees };
//   // }

//   render() {
//     const { classes, followees } = this.props;

//     return (
//       <Paper className={classes.root}>
//         <Table className={classes.table} aria-label="simple table">
//           {/* <TableHead>
//             <TableRow>
//               <TableCell>Dessert (100g serving)</TableCell>
//               <TableCell align="right">Calories</TableCell>
//               <TableCell align="right">Fat&nbsp;(g)</TableCell>
//               <TableCell align="right">Carbs&nbsp;(g)</TableCell>
//               <TableCell align="right">Protein&nbsp;(g)</TableCell>
//             </TableRow>
//           </TableHead> */}
//           <TableBody>
//             {data.map((row) => (
//               <TableRow key={row.name}>
//                 <TableCell component="th" scope="row">
//                   {row.name}
//                 </TableCell>
//                 <TableCell align="right">{row.calories}</TableCell>
//                 <TableCell align="right">{row.fat}</TableCell>
//                 <TableCell align="right">{row.carbs}</TableCell>
//                 <TableCell align="right">{row.protein}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Paper>
//     );
//   }
// }

// SimpleTable.propTypes = {
//   classes: PropTypes.shape({
//     // paper: PropTypes.string.isRequired,
//     // avatar: PropTypes.string.isRequired,
//     // form: PropTypes.string.isRequired,
//     // submit: PropTypes.string.isRequired,
//     root: PropTypes.string.isRequired,
//     table: PropTypes.any.isRequired,
//   }).isRequired,
// };

// export default withStyles(styles)(SimpleTable);
// /** @flow */
// import Immutable from 'immutable';
// import PropTypes from 'prop-types';
// import * as React from 'react';
// import {
//   ContentBox,
//   ContentBoxHeader,
//   ContentBoxParagraph,
// } from '../demo/ContentBox';
// import { LabeledInput, InputRow } from '../demo/LabeledInput';
// import AutoSizer from '../AutoSizer';
// import { Column, Table, SortDirection, SortIndicator } from 'react-virtualized';
// // import Table from './Table';
// // import SortDirection from './SortDirection';
// // import SortIndicator from './SortIndicator';
// import styles from 'react-virtualized/styles.css'

// export default class TableExample extends React.PureComponent {
//   static contextTypes = {
//     list: PropTypes.instanceOf(Immutable.List).isRequired,
//   };

//   constructor(props, context) {
//     super(props, context);

//     const sortBy = 'index';
//     const sortDirection = SortDirection.ASC;
//     const sortedList = this._sortList({ sortBy, sortDirection });

//     this.state = {
//       disableHeader: false,
//       headerHeight: 30,
//       height: 270,
//       hideIndexRow: false,
//       overscanRowCount: 10,
//       rowHeight: 40,
//       rowCount: 1000,
//       scrollToIndex: undefined,
//       sortBy,
//       sortDirection,
//       sortedList,
//       useDynamicRowHeight: false,
//     };

//     this._getRowHeight = this._getRowHeight.bind(this);
//     this._headerRenderer = this._headerRenderer.bind(this);
//     this._noRowsRenderer = this._noRowsRenderer.bind(this);
//     this._onRowCountChange = this._onRowCountChange.bind(this);
//     this._onScrollToRowChange = this._onScrollToRowChange.bind(this);
//     this._rowClassName = this._rowClassName.bind(this);
//     this._sort = this._sort.bind(this);
//   }

//   render() {
//     const {
//       disableHeader,
//       headerHeight,
//       height,
//       hideIndexRow,
//       overscanRowCount,
//       rowHeight,
//       rowCount,
//       scrollToIndex,
//       sortBy,
//       sortDirection,
//       sortedList,
//       useDynamicRowHeight,
//     } = this.state;

//     const rowGetter = ({ index }) => this._getDatum(sortedList, index);

//     return (
//       <ContentBox>
//         <ContentBoxHeader
//           text="Table"
//           sourceLink="https://github.com/bvaughn/react-virtualized/blob/master/source/Table/Table.example.js"
//           docsLink="https://github.com/bvaughn/react-virtualized/blob/master/docs/Table.md"
//         />

//         <ContentBoxParagraph>
//           The table layout below is created with flexboxes. This allows it to
//           have a fixed header and scrollable body content. It also makes use of{' '}
//           <code>Grid</code> for windowing table content so that large lists are
//           rendered efficiently. Adjust its configurable properties below to see
//           how it reacts.
//         </ContentBoxParagraph>

//         <ContentBoxParagraph>
//           <label className={styles.checkboxLabel}>
//             <input
//               aria-label="Use dynamic row heights?"
//               checked={useDynamicRowHeight}
//               className={styles.checkbox}
//               type="checkbox"
//               onChange={event =>
//                 this._updateUseDynamicRowHeight(event.target.checked)
//               }
//             />
//             Use dynamic row heights?
//           </label>

//           <label className={styles.checkboxLabel}>
//             <input
//               aria-label="Hide index?"
//               checked={hideIndexRow}
//               className={styles.checkbox}
//               type="checkbox"
//               onChange={event =>
//                 this.setState({ hideIndexRow: event.target.checked })
//               }
//             />
//             Hide index?
//           </label>

//           <label className={styles.checkboxLabel}>
//             <input
//               aria-label="Hide header?"
//               checked={disableHeader}
//               className={styles.checkbox}
//               type="checkbox"
//               onChange={event =>
//                 this.setState({ disableHeader: event.target.checked })
//               }
//             />
//             Hide header?
//           </label>
//         </ContentBoxParagraph>

//         <InputRow>
//           <LabeledInput
//             label="Num rows"
//             name="rowCount"
//             onChange={this._onRowCountChange}
//             value={rowCount}
//           />
//           <LabeledInput
//             label="Scroll to"
//             name="onScrollToRow"
//             placeholder="Index..."
//             onChange={this._onScrollToRowChange}
//             value={scrollToIndex || ''}
//           />
//           <LabeledInput
//             label="List height"
//             name="height"
//             onChange={event =>
//               this.setState({ height: parseInt(event.target.value, 10) || 1 })
//             }
//             value={height}
//           />
//           <LabeledInput
//             disabled={useDynamicRowHeight}
//             label="Row height"
//             name="rowHeight"
//             onChange={event =>
//               this.setState({
//                 rowHeight: parseInt(event.target.value, 10) || 1,
//               })
//             }
//             value={rowHeight}
//           />
//           <LabeledInput
//             label="Header height"
//             name="headerHeight"
//             onChange={event =>
//               this.setState({
//                 headerHeight: parseInt(event.target.value, 10) || 1,
//               })
//             }
//             value={headerHeight}
//           />
//           <LabeledInput
//             label="Overscan"
//             name="overscanRowCount"
//             onChange={event =>
//               this.setState({
//                 overscanRowCount: parseInt(event.target.value, 10) || 0,
//               })
//             }
//             value={overscanRowCount}
//           />
//         </InputRow>

//         <div>
//           <AutoSizer disableHeight>
//             {({ width }) => (
//               <Table
//                 ref="Table"
//                 disableHeader={disableHeader}
//                 headerClassName={styles.headerColumn}
//                 headerHeight={headerHeight}
//                 height={height}
//                 noRowsRenderer={this._noRowsRenderer}
//                 overscanRowCount={overscanRowCount}
//                 rowClassName={this._rowClassName}
//                 rowHeight={useDynamicRowHeight ? this._getRowHeight : rowHeight}
//                 rowGetter={rowGetter}
//                 rowCount={rowCount}
//                 scrollToIndex={scrollToIndex}
//                 sort={this._sort}
//                 sortBy={sortBy}
//                 sortDirection={sortDirection}
//                 width={width}>
//                 {!hideIndexRow && (
//                   <Column
//                     label="Index"
//                     cellDataGetter={({ rowData }) => rowData.index}
//                     dataKey="index"
//                     disableSort={!this._isSortEnabled()}
//                     width={60}
//                   />
//                 )}
//                 <Column
//                   dataKey="name"
//                   disableSort={!this._isSortEnabled()}
//                   headerRenderer={this._headerRenderer}
//                   width={90}
//                 />
//                 <Column
//                   width={210}
//                   disableSort
//                   label="The description label is really long so that it will be truncated"
//                   dataKey="random"
//                   className={styles.exampleColumn}
//                   cellRenderer={({ cellData }) => cellData}
//                   flexGrow={1}
//                 />
//               </Table>
//             )}
//           </AutoSizer>
//         </div>
//       </ContentBox>
//     );
//   }

//   _getDatum(list, index) {
//     return list.get(index % list.size);
//   }

//   _getRowHeight({ index }) {
//     const { list } = this.context;

//     return this._getDatum(list, index).size;
//   }

//   _headerRenderer({ dataKey, sortBy, sortDirection }) {
//     return (
//       <div>
//         Full Name
//         {sortBy === dataKey && <SortIndicator sortDirection={sortDirection} />}
//       </div>
//     );
//   }

//   _isSortEnabled() {
//     const { list } = this.context;
//     const { rowCount } = this.state;

//     return rowCount <= list.size;
//   }

//   _noRowsRenderer() {
//     return <div className={styles.noRows}>No rows</div>;
//   }

//   _onRowCountChange(event) {
//     const rowCount = parseInt(event.target.value, 10) || 0;

//     this.setState({ rowCount });
//   }

//   _onScrollToRowChange(event) {
//     const { rowCount } = this.state;
//     let scrollToIndex = Math.min(
//       rowCount - 1,
//       parseInt(event.target.value, 10),
//     );

//     if (isNaN(scrollToIndex)) {
//       scrollToIndex = undefined;
//     }

//     this.setState({ scrollToIndex });
//   }

//   _rowClassName({ index }) {
//     if (index < 0) {
//       return styles.headerRow;
//     } else {
//       return index % 2 === 0 ? styles.evenRow : styles.oddRow;
//     }
//   }

//   _sort({ sortBy, sortDirection }) {
//     const sortedList = this._sortList({ sortBy, sortDirection });

//     this.setState({ sortBy, sortDirection, sortedList });
//   }

//   _sortList({ sortBy, sortDirection }) {
//     const { list } = this.context;

//     return list
//       .sortBy(item => item[sortBy])
//       .update(
//         list => (sortDirection === SortDirection.DESC ? list.reverse() : list),
//       );
//   }

//   _updateUseDynamicRowHeight(value) {
//     this.setState({
//       useDynamicRowHeight: value,
//     });
//   }
// }

// /* eslint-disable react/jsx-props-no-spreading */
// import React from 'react';
// import MaterialTable from 'material-table';
// import PropTypes from 'prop-types';
// import AddBox from '@material-ui/icons/AddBox';
// import ArrowUpward from '@material-ui/icons/ArrowUpward';
// import Check from '@material-ui/icons/Check';
// import ChevronLeft from '@material-ui/icons/ChevronLeft';
// import ChevronRight from '@material-ui/icons/ChevronRight';
// import Clear from '@material-ui/icons/Clear';
// import DeleteOutline from '@material-ui/icons/DeleteOutline';
// import Edit from '@material-ui/icons/Edit';
// import FilterList from '@material-ui/icons/FilterList';
// import FirstPage from '@material-ui/icons/FirstPage';
// import LastPage from '@material-ui/icons/LastPage';
// import Remove from '@material-ui/icons/Remove';
// import SaveAlt from '@material-ui/icons/SaveAlt';
// import Search from '@material-ui/icons/Search';
// import ViewColumn from '@material-ui/icons/ViewColumn';
// import ToolTip from '@material-ui/core/Tooltip';


// export default function MaterialTableDemo(propsPassed) {
//   const { bProfilePage } = propsPassed;
//   const tableIcons = {
//     Add: React.forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
//     Check: React.forwardRef((props, ref) => <Check {...props} ref={ref} />),
//     Clear: React.forwardRef((props, ref) => <Clear {...props} ref={ref} />),
//     Delete: React.forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
//     DetailPanel: React.forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
//     Edit: React.forwardRef((props, ref) => <Edit {...props} ref={ref} />),
//     Export: React.forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
//     Filter: React.forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
//     FirstPage: React.forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
//     LastPage: React.forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
//     NextPage: React.forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
//     PreviousPage: React.forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
//     ResetSearch: React.forwardRef((props, ref) => <Clear {...props} ref={ref} />),
//     Search: React.forwardRef((props, ref) => <Search {...props} ref={ref} />),
//     SortArrow: React.forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
//     ThirdStateCheck: React.forwardRef((props, ref) => <Remove {...props} ref={ref} />),
//     ViewColumn: React.forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
//   };
//   const [state, setState] = React.useState({
//     columns: [
//       { title: 'Name', field: 'name' },
//       { title: 'Surname', field: 'surname' },
//       { title: 'Birth Year', field: 'birthYear', type: 'numeric' },
//       {
//         title: 'Birth Place',
//         field: 'birthCity',
//         lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' },
//       },
//     ],
//     data: [
//       { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
//       {
//         name: 'Zerya Betül',
//         surname: 'Baran',
//         birthYear: 2017,
//         birthCity: 34,
//       },
//     ],
//   });

//   return (
//     <MaterialTable
//       title="Editable Example"
//       columns={state.columns}
//       data={state.data}
//       icons={tableIcons}
//       editable={bProfilePage ? {
//         onRowDelete: (oldData) => new Promise((resolve) => {
//           setTimeout(() => {
//             resolve();
//             setState((prevState) => {
//               const data = [...prevState.data];
//               data.splice(data.indexOf(oldData), 1);
//               return { ...prevState, data };
//             });
//           }, 600);
//         }),
//       }
//         : {
//           onRowAdd: (newData) => new Promise((resolve) => {
//             setTimeout(() => {
//               resolve();
//               setState((prevState) => {
//                 const data = [...prevState.data];
//                 data.push(newData);
//                 return { ...prevState, data };
//               });
//             }, 600);
//           }),
//         }}
//     />
//   );
// }

// import React from 'react';
// import PropTypes from 'prop-types';
// import clsx from 'clsx';
// import { lighten, makeStyles } from '@material-ui/core/styles';
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableHead from '@material-ui/core/TableHead';
// import TablePagination from '@material-ui/core/TablePagination';
// import TableRow from '@material-ui/core/TableRow';
// import TableSortLabel from '@material-ui/core/TableSortLabel';
// import Toolbar from '@material-ui/core/Toolbar';
// import Typography from '@material-ui/core/Typography';
// import Paper from '@material-ui/core/Paper';
// import Checkbox from '@material-ui/core/Checkbox';
// import IconButton from '@material-ui/core/IconButton';
// import Tooltip from '@material-ui/core/Tooltip';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Switch from '@material-ui/core/Switch';
// import DeleteIcon from '@material-ui/icons/Delete';
// import FilterListIcon from '@material-ui/icons/FilterList';

// function createData(name, calories, fat, carbs, protein) {
//   return { name, calories, fat, carbs, protein };
// }

// const rows = [
//   createData('Cupcake', 305, 3.7, 67, 4.3),
//   createData('Donut', 452, 25.0, 51, 4.9),
//   createData('Eclair', 262, 16.0, 24, 6.0),
//   createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
//   createData('Gingerbread', 356, 16.0, 49, 3.9),
//   createData('Honeycomb', 408, 3.2, 87, 6.5),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//   createData('Jelly Bean', 375, 0.0, 94, 0.0),
//   createData('KitKat', 518, 26.0, 65, 7.0),
//   createData('Lollipop', 392, 0.2, 98, 0.0),
//   createData('Marshmallow', 318, 0, 81, 2.0),
//   createData('Nougat', 360, 19.0, 9, 37.0),
//   createData('Oreo', 437, 18.0, 63, 4.0),
// ];

// function desc(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1;
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1;
//   }
//   return 0;
// }

// function stableSort(array, cmp) {
//   const stabilizedThis = array.map((el, index) => [el, index]);
//   stabilizedThis.sort((a, b) => {
//     const order = cmp(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });
//   return stabilizedThis.map(el => el[0]);
// }

// function getSorting(order, orderBy) {
//   return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
// }

// const headCells = [
//   { id: 'name', numeric: false, disablePadding: true, label: 'Dessert (100g serving)' },
//   { id: 'calories', numeric: true, disablePadding: false, label: 'Calories' },
//   { id: 'fat', numeric: true, disablePadding: false, label: 'Fat (g)' },
//   { id: 'carbs', numeric: true, disablePadding: false, label: 'Carbs (g)' },
//   { id: 'protein', numeric: true, disablePadding: false, label: 'Protein (g)' },
// ];

// function EnhancedTableHead(props) {
//   const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
//   const createSortHandler = property => event => {
//     onRequestSort(event, property);
//   };

//   return (
//     <TableHead>
//       <TableRow>
//         <TableCell padding="checkbox">
//           <Checkbox
//             indeterminate={numSelected > 0 && numSelected < rowCount}
//             checked={numSelected === rowCount}
//             onChange={onSelectAllClick}
//             inputProps={{ 'aria-label': 'select all desserts' }}
//           />
//         </TableCell>
//         {headCells.map(headCell => (
//           <TableCell
//             key={headCell.id}
//             align={headCell.numeric ? 'right' : 'left'}
//             padding={headCell.disablePadding ? 'none' : 'default'}
//             sortDirection={orderBy === headCell.id ? order : false}
//           >
//             <TableSortLabel
//               active={orderBy === headCell.id}
//               direction={order}
//               onClick={createSortHandler(headCell.id)}
//             >
//               {headCell.label}
//               {orderBy === headCell.id ? (
//                 <span className={classes.visuallyHidden}>
//                   {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
//                 </span>
//               ) : null}
//             </TableSortLabel>
//           </TableCell>
//         ))}
//       </TableRow>
//     </TableHead>
//   );
// }

// EnhancedTableHead.propTypes = {
//   classes: PropTypes.object.isRequired,
//   numSelected: PropTypes.number.isRequired,
//   onRequestSort: PropTypes.func.isRequired,
//   onSelectAllClick: PropTypes.func.isRequired,
//   order: PropTypes.oneOf(['asc', 'desc']).isRequired,
//   orderBy: PropTypes.string.isRequired,
//   rowCount: PropTypes.number.isRequired,
// };

// const useToolbarStyles = makeStyles(theme => ({
//   root: {
//     paddingLeft: theme.spacing(2),
//     paddingRight: theme.spacing(1),
//   },
//   highlight:
//     theme.palette.type === 'light'
//       ? {
//         color: theme.palette.secondary.main,
//         backgroundColor: lighten(theme.palette.secondary.light, 0.85),
//       }
//       : {
//         color: theme.palette.text.primary,
//         backgroundColor: theme.palette.secondary.dark,
//       },
//   title: {
//     flex: '1 1 100%',
//   },
// }));

// const EnhancedTableToolbar = props => {
//   const classes = useToolbarStyles();
//   const { numSelected } = props;

//   return (
//     <Toolbar
//       className={clsx(classes.root, {
//         [classes.highlight]: numSelected > 0,
//       })}
//     >
//       {numSelected > 0 ? (
//         <Typography className={classes.title} color="inherit" variant="subtitle1">
//           {numSelected} selected
//         </Typography>
//       ) : (
//           <Typography className={classes.title} variant="h6" id="tableTitle">
//             Nutrition
//         </Typography>
//         )}

//       {numSelected > 0 ? (
//         <Tooltip title="Delete">
//           <IconButton aria-label="delete">
//             <DeleteIcon />
//           </IconButton>
//         </Tooltip>
//       ) : (
//           <Tooltip title="Filter list">
//             <IconButton aria-label="filter list">
//               <FilterListIcon />
//             </IconButton>
//           </Tooltip>
//         )}
//     </Toolbar>
//   );
// };

// EnhancedTableToolbar.propTypes = {
//   numSelected: PropTypes.number.isRequired,
// };

// const useStyles = makeStyles(theme => ({
//   root: {
//     width: '100%',
//     marginTop: theme.spacing(3),
//   },
//   paper: {
//     width: '100%',
//     marginBottom: theme.spacing(2),
//   },
//   table: {
//     minWidth: 750,
//   },
//   tableWrapper: {
//     overflowX: 'auto',
//   },
//   visuallyHidden: {
//     border: 0,
//     clip: 'rect(0 0 0 0)',
//     height: 1,
//     margin: -1,
//     overflow: 'hidden',
//     padding: 0,
//     position: 'absolute',
//     top: 20,
//     width: 1,
//   },
// }));

// export default function EnhancedTable() {
//   const classes = useStyles();
//   const [order, setOrder] = React.useState('asc');
//   const [orderBy, setOrderBy] = React.useState('calories');
//   const [selected, setSelected] = React.useState([]);
//   const [page, setPage] = React.useState(0);
//   const [dense, setDense] = React.useState(false);
//   const [rowsPerPage, setRowsPerPage] = React.useState(5);

//   const handleRequestSort = (event, property) => {
//     const isDesc = orderBy === property && order === 'desc';
//     setOrder(isDesc ? 'asc' : 'desc');
//     setOrderBy(property);
//   };

//   const handleSelectAllClick = event => {
//     if (event.target.checked) {
//       const newSelecteds = rows.map(n => n.name);
//       setSelected(newSelecteds);
//       return;
//     }
//     setSelected([]);
//   };

//   const handleClick = (event, name) => {
//     const selectedIndex = selected.indexOf(name);
//     let newSelected = [];

//     if (selectedIndex === -1) {
//       newSelected = newSelected.concat(selected, name);
//     } else if (selectedIndex === 0) {
//       newSelected = newSelected.concat(selected.slice(1));
//     } else if (selectedIndex === selected.length - 1) {
//       newSelected = newSelected.concat(selected.slice(0, -1));
//     } else if (selectedIndex > 0) {
//       newSelected = newSelected.concat(
//         selected.slice(0, selectedIndex),
//         selected.slice(selectedIndex + 1),
//       );
//     }

//     setSelected(newSelected);
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = event => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleChangeDense = event => {
//     setDense(event.target.checked);
//   };

//   const isSelected = name => selected.indexOf(name) !== -1;

//   const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

//   return (
//     <div className={classes.root}>
//       <Paper className={classes.paper}>
//         <EnhancedTableToolbar numSelected={selected.length} />
//         <div className={classes.tableWrapper}>
//           <Table
//             className={classes.table}
//             aria-labelledby="tableTitle"
//             size={dense ? 'small' : 'medium'}
//             aria-label="enhanced table"
//           >
//             <EnhancedTableHead
//               classes={classes}
//               numSelected={selected.length}
//               order={order}
//               orderBy={orderBy}
//               onSelectAllClick={handleSelectAllClick}
//               onRequestSort={handleRequestSort}
//               rowCount={rows.length}
//             />
//             <TableBody>
//               {stableSort(rows, getSorting(order, orderBy))
//                 .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                 .map((row, index) => {
//                   const isItemSelected = isSelected(row.name);
//                   const labelId = `enhanced-table-checkbox-${index}`;

//                   return (
//                     <TableRow
//                       hover
//                       onClick={event => handleClick(event, row.name)}
//                       role="checkbox"
//                       aria-checked={isItemSelected}
//                       tabIndex={-1}
//                       key={row.name}
//                       selected={isItemSelected}
//                     >
//                       <TableCell padding="checkbox">
//                         <Checkbox
//                           checked={isItemSelected}
//                           inputProps={{ 'aria-labelledby': labelId }}
//                         />
//                       </TableCell>
//                       <TableCell component="th" id={labelId} scope="row" padding="none">
//                         {row.name}
//                       </TableCell>
//                       <TableCell align="right">{row.calories}</TableCell>
//                       <TableCell align="right">{row.fat}</TableCell>
//                       <TableCell align="right">{row.carbs}</TableCell>
//                       <TableCell align="right">{row.protein}</TableCell>
//                     </TableRow>
//                   );
//                 })}
//               {emptyRows > 0 && (
//                 <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
//                   <TableCell colSpan={6} />
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//         <TablePagination
//           rowsPerPageOptions={[5, 10, 25]}
//           component="div"
//           count={rows.length}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           backIconButtonProps={{
//             'aria-label': 'previous page',
//           }}
//           nextIconButtonProps={{
//             'aria-label': 'next page',
//           }}
//           onChangePage={handleChangePage}
//           onChangeRowsPerPage={handleChangeRowsPerPage}
//         />
//       </Paper>
//       <FormControlLabel
//         control={<Switch checked={dense} onChange={handleChangeDense} />}
//         label="Dense padding"
//       />
//     </div>
//   );
// }