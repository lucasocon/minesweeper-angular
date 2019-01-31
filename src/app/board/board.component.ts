import { Component, OnInit } from '@angular/core';
import {
  find,
  times, 
  range,
  flatten,
  filter,
  forEach,
  sampleSize,
  isUndefined,
  noop } from "lodash";

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  boardRows: number;
  boardColumns: number;
  mines: number;
  remainingFlags: number 
  maxNumberOfMines: number;
  board: any = [];
  gameOver: boolean =  false;

  constructor() {};
  ngOnInit() {
    this.setupBoard();
    this.addMines();
    this.setNearMines();
  }

  setupBoard() {
    console.log(this)
    this.boardColumns = this.boardColumns || 6
    this.boardRows = this.boardRows || 6
    this.mines = this.mines || 4;
    this.remainingFlags = this.mines;
    this.maxNumberOfMines = (this.boardColumns * this.boardRows) - 1;

    this.board = times(this.boardRows, (row) => {
      return times(this.boardColumns, (col) => {
        return {
          row: row,
          col: col,
          opened: false,
          hasFlag: false,
          isMine: false,
          nearMines: null
        }
      })
    });
  }

  newGame() {
    this.setupBoard();
    this.addMines();
    this.setNearMines();
    this.gameOver = false;
  };

  openCell(cell, event) {
    if(event && event.which && event.which === 3) {
      this.toggleFlag(cell);
      return false;
    }

    if (this.gameOver) return;

    let flatBoard = flatten(this.board);
    cell.opened = true;

    let toReveal = (!cell.isMine && cell.nearMines === null) ?
      filter(this.getNearCells(cell), {opened: false as any, hasFlag: false as any}) : [];
    toReveal = (cell.isMine) ? filter(flatBoard, { opened: false, isMine: true, hasFlag: false }) : toReveal;

    forEach(toReveal, (cell) => {
      let cell_to_open = find(this.board[cell.row], (e) => { return e.col == cell.col; });
      this.openCell(cell_to_open, event);
    });

    this.gameOver = cell.isMine || this.getClosedNonMines().length === 0;
    return this.gameOver;
  }

  addMines() {
    let cells = sampleSize(flatten(this.board), this.mines);
    forEach(cells, (cell : any) => {
      cell.isMine = true;
    });
  }

  getClosedNonMines() {
    return  filter(flatten(this.board), { isMine: false, opened: false });
  }

  setNearMines() {
    return forEach(this.getClosedNonMines(), (cell : any) => {
      let nearMines = filter(this.getNearCells(cell), (cell) => {
        return cell.isMine;
      });
      cell.nearMines = nearMines.length > 0 ? nearMines.length : null;
    });
  }

  getNearCells(cell : any) {
    let cells = [];
    forEach(range(-1, 2), (i) => {
      forEach(range(-1, 2), (j) => {
        let row = this.board[cell.row + i];
        let col = cell.col + j;
        (isUndefined(row) || isUndefined(row[col])) ? noop() : cells.push(row[col]);
      });
    });
    return cells;
  }

  toggleFlag(cell : any) {
    if (this.gameOver) return;
    if (this.remainingFlags === 0 && !cell.hasFlag) return;
    
    cell.hasFlag = !cell.hasFlag;
    this.remainingFlags -= cell.hasFlag ? 1 : -1;
  }
}
