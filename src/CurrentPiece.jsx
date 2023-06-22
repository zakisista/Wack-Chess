class CurrentPiece {
    constructor(coordinate, trialBoardState) {
      this.blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"]
      this.whitePieces = ["♙", "♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]

      if (Array.isArray(coordinate)) {
        this.piece = trialBoardState[coordinate[0]][coordinate[1]];
      }

      this.pieceIsWhite = true;
      if (this.blackPieces.includes(this.piece)) {
        this.pieceIsWhite = false;
      }

      if (this.pieceIsWhite) {
        this.color = "White"
      } else {
        this.color = "Black"
      }

      this.availableMovesArray = []
      this.attackMovesArray = []
      this.trialBoardState = trialBoardState

    }
  
    samePiece(current_row, current_col) {
      let newPiece = trialBoardState[current_row][current_col];
      let newPieceIsWhite = whitePieces.includes(newPiece);
      return newPieceIsWhite === this.pieceIsWhite;
    }
  
    coordinateExists(newRow, newCol) {
      let exists = typeof this.trialBoardState[newRow] !== 'undefined' && typeof this.trialBoardState[newRow][newCol] !== 'undefined'
      return exists
    }
  
    addMove(coordinate, move, scale, stopIfPiece) {
      let add = true
      if (!scale) {
        scale = 1
      }
      let scaleLength = structuredClone(scale)
  
      if (stopIfPiece === true) {
        let newRow = coordinate[0] + scaleLength * move[0]
        let newCol = coordinate[1] + scaleLength * move[1]
        let samePieceExists = false;
  
        //if move exists
        if (this.coordinateExists(newRow, newCol)) {
          this.attackMovesArray.push([newRow, newCol]) //For the attack map
          console.log([newRow, newCol], samePieceExists)
  
          if (
            this.trialBoardState[newRow][newCol] &&
            this.samePiece(newRow, newCol)
          ) {
            add = false
            return add
          }
          if (
            this.trialBoardState[newRow][newCol] &&
            !this.samePiece(newRow, newCol)
          ) {
            this.availableMovesArray.push([newRow, newCol])
            add = false
            return add
          }
  
          this.availableMovesArray.push([newRow, newCol])
        }
        if (!this.coordinateExists(newRow, newCol)) {
          add = false
          return false
        }
        return add
      }
  
      let newRow = coordinate[0] + scaleLength * move[0]
      let newCol = coordinate[1] + scaleLength * move[1]
      //if move exists
      if (this.coordinateExists(newRow, newCol)) {
        this.attackMovesArray.push([newRow, newCol]) //For the attack map
        //if that square contains a piece of the same color
        if (
          trialBoardState[newRow][newCol] &&
          this.samePiece(newRow, newCol)
        ) {
          return
        }
        this.availableMovesArray.push([newRow, newCol])
      }
      return add
    }
  }

  export { CurrentPiece }
  