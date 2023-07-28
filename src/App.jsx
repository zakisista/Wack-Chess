import { useState, useEffect } from 'react'



function App() {
  
  const [trialBoardState, setTrialBoardState] = useState([
    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
  ])


  
  return (
    <>
      <div className='flex justify-center mt-32'>
        <Board trialBoardState={trialBoardState} setTrialBoardState={setTrialBoardState}/>
      </div>
    </>
  )
}

function Board({trialBoardState, setTrialBoardState}) {

  const [ids, setIds] = useState(Array.from({length: 64}, (_, i) => i))
  const [firstClick, setFirstClick] = useState(undefined)
  const [isWhiteTurn, setisWhiteTurn] = useState(true)
  const [moveCount, setMoveCount] = useState(0)
  const [previousBoardState, setPreviousBoardState] = useState([
    [["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]]
  ])
  const [colors, setColors] = useState(() => {
    let color_arr = [];
    let boardSize = 8;
    let isBlack = false;
    
    for (let i = 0; i < boardSize * boardSize; i++) {
      if (isBlack) {
        color_arr.push("bg-gray-400");
      } else {
        color_arr.push("bg-gray-100");
      }
      isBlack = !isBlack;
      if ((i + 1) % boardSize === 0) {
        isBlack = !isBlack;
      }
    }
    return color_arr
  })
  const [enpassant, setEnpassant] = useState({capture: [null, null], count: null, move: [null, null]})
  const [blackKing, setBlackKing] = useState({position: [0, 4], hasMoved: false, isChecked: false, castleSquaresAttacked: false})
  const [whiteKing, setWhiteKing] = useState({position: [7, 4], hasMoved: false, isChecked: false, castleSquaresAttacked: false})
  const [whiteAttackMap, setWhiteAttackMap] = useState([])
  const [blackAttackMap, setBlackAttackMap] = useState([])

  const [pawnToChange, setPawnToChange] = useState({pawnToChange: false, coordinate: [], previousCoordinate: []})

  const [whiteCanCastle, setWhiteCanCastle] = useState({kingMoved: false, queenRookMoved: false, kingRookMoved: false, canCastle: false})
  const [blackCanCastle, setBlackCanCastle] = useState({kingMoved: false, queenRookMoved: false, kingRookMoved: false, canCastle: false}) //If king moved or if either rook moved

  let changePawnColors = ["bg-gray-400", "bg-gray-100", "bg-gray-400", "bg-gray-100"]
  let pawnBlackPieces = ["♜", "♞", "♝", "♛"]
  let pawnWhitePieces = ["♖", "♘", "♗", "♕"]

  

 

  
  useEffect(() => {
    if (moveCount === 0) {
      return
    }
    setPreviousBoardState((prev) => {
      let newState = [...prev]
      newState.push(structuredClone(trialBoardState))
      return newState
    })
  }, [moveCount])

  
  //Check if a coordinate is in a list of available moves
  function coordinateInAvaliableMoves(coordinate, availableMoves) {
    let value = availableMoves.some((a) => a.every((v, i) => v === coordinate[i])); // if it works it works   
    return value 
  }
  
  //Spagetti spagetti spagetti... Also this checks if a king is under attack
  function setAttackMap(changeBoardState, setTheState = true) {
    let blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"]
    let whitePieces = ["♙","♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]

    let blackAttackMap = []
    let whiteAttackMap = []
    let blackPieceCoordinates = []
    let whitePieceCoordinates = []

    let piecesAttackingBlackKing = {}
    let piecesAttackingWhiteKing = {}

    function kingUnderCheck(currentBlackAttackMap, currentWhiteAttackMap) {
      if (coordinateInAvaliableMoves(whiteKing.position, currentBlackAttackMap)) {
        return('♔')
      }
      if (coordinateInAvaliableMoves(blackKing.position, currentWhiteAttackMap)) {
        return('♚')
      }
      return null
    }

    //Fetch coordinates of white and black pieces in the current boardstate
    for (let row = 0; row < changeBoardState.length; row++) {
      for (let col = 0; col < changeBoardState[0].length; col++) {
        if (blackPieces.includes(changeBoardState[row][col])) {
          blackPieceCoordinates.push([row, col])
        }
        if (whitePieces.includes(changeBoardState[row][col])) {
          whitePieceCoordinates.push([row, col])
        }
      }
    }
    
    //Creating black Attack Map
    for (let i = 0; i < blackPieceCoordinates.length; i++) {
      let current_coordinate = blackPieceCoordinates[i]
      let current_piece = changeBoardState[current_coordinate[0]][current_coordinate[1]]
      let current_list = currentAvailableMoves(current_coordinate, true, changeBoardState) //Attack moves "true"
      
      if (current_list) {
        //If the white king position exists in the current attack moves, store the piece attacking the king
        if (coordinateInAvaliableMoves(whiteKing.position, current_list)) {
          piecesAttackingWhiteKing[current_coordinate] = current_piece
        }
        for (let j = 0; j < current_list.length; j++) {
          blackAttackMap.push(current_list[j])
        }
      }
    }

    //White Attack Map
    for (let i = 0; i < whitePieceCoordinates.length; i++) {
      let current_coordinate = whitePieceCoordinates[i]
      let current_piece = changeBoardState[current_coordinate[0]][current_coordinate[1]]
      let current_list = currentAvailableMoves(current_coordinate, true, changeBoardState)


      if (current_list) {

        if (coordinateInAvaliableMoves(blackKing.position, current_list)) {
          piecesAttackingBlackKing[current_coordinate] = current_piece
        }
        for (let j = 0; j < current_list.length; j++) {
          whiteAttackMap.push(current_list[j])
        }
      }
    }

    //Display pieces attacking king if there is a piece attackign the king
    if ((Object.entries(piecesAttackingWhiteKing).length != 0) || (Object.entries(piecesAttackingBlackKing).length != 0)) {
      
      console.log("pieces attacking kings")
      console.log(piecesAttackingWhiteKing)
      console.log(piecesAttackingBlackKing)
    }

    let uniqueBlackAttackMap = Array.from(new Set(structuredClone(blackAttackMap).map(JSON.stringify)), JSON.parse)
    let uniqueWhiteAttackMap = Array.from(new Set(structuredClone(whiteAttackMap).map(JSON.stringify)), JSON.parse)

    let whichKingUnderAttack = kingUnderCheck(uniqueBlackAttackMap, uniqueWhiteAttackMap) //string containing which king is under attack or null

    if (!setTheState) {
      return whichKingUnderAttack
    }

    setBlackAttackMap(uniqueBlackAttackMap)
    setWhiteAttackMap(uniqueWhiteAttackMap)
  }

  //Return List of available moves
  function currentAvailableMoves(coordinate, attack, boardState = trialBoardState) {
    let blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"]
    let whitePieces = ["♙", "♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]

    let availableMovesArray = []
    let attackMovesArray = []
    let pieceIsWhite = true
    let piece = null

    //if the square contains a piece
    if (Array.isArray(coordinate)) {
      piece = boardState[coordinate[0]][coordinate[1]]
    }
    //Is current piece white
    if (blackPieces.includes(piece)) {
      pieceIsWhite = false
    }

    function samePiece(current_row, current_col) {
      //This function works
      let newPiece = boardState[current_row][current_col]
      let newPieceIsWhite = whitePieces.includes(newPiece) 
      return(newPieceIsWhite === pieceIsWhite)
    }
    
    function coordinateExists(newRow, newCol) {
      let exists = typeof boardState[newRow] !== 'undefined' && typeof boardState[newRow][newCol] !== 'undefined'
      return exists
    }
    //appends attackMovesArray and availableMoves conditionally
    function addMove(move, scale = 1) {
      let add = true
      let scaleLength = structuredClone(scale)
      let newRow = coordinate[0] + scaleLength*move[0]
      let newCol = coordinate[1] + scaleLength*move[1]

      if (!coordinateExists(newRow, newCol)) {
        return false
      }

      //This will have it's own return function to make things easier for now
      if (piece == "♙" || piece == "♟") {

        //If the move is NOT an attack move
        if (move[1]**2 === 0) {
          //if a piece exists on the square
          if (boardState[newRow][newCol]) {
            add = false
          }
        }
        //If the move IS an attack move
        if (move[1]**2 === 1) {
          attackMovesArray.push([newRow, newCol]) //Attack map
          //if the square is empty or contains a piece of the same color
          if (!boardState[newRow][newCol] || (boardState[newRow][newCol] && samePiece(newRow, newCol))) {
            add = false
          }
        }

        if (add) {
          availableMovesArray.push([newRow, newCol])
        }
        return add
      }

      //If You want the itteration to stop after a piece has blocked the path
      if (boardState[newRow][newCol]) {
        add = false
        if (!samePiece(newRow, newCol)) {
          availableMovesArray.push([newRow, newCol])
        }
      }

      if (add) {
        availableMovesArray.push([newRow, newCol])
      }
      attackMovesArray.push([newRow, newCol]) //Attack map


      return add
    }

    function generateMoveList() {

      //Pieces
      //White Pawn
      if (piece == "♙" || piece == "♟") {
        let multiplier = pieceIsWhite ? -1 : 1
  
        let defaultMove = [
          [1*multiplier, 0]
        ]
  
        let moves = [
          [1*multiplier, 0],
          [2*multiplier, 0]
        ]
  
        let captureMoves = [
          [1*multiplier, 1],
          [1*multiplier, -1]
        ]
        
        //Add Capture Moves
        for (let i = 0; i < captureMoves.length; i++) {
          let captureMove = captureMoves[i]
          //If there is a piece
          addMove(captureMove)
        }
        
        //The first move
        if ((coordinate[0] == 6 && pieceIsWhite) || coordinate[0] == 1 && !pieceIsWhite) {
          //Add normal Moves
          for (let i = 0; i < moves.length; i++) {
            let move = moves[i]
            let add = addMove(move)   
            if (add === false) {
              break
            }
          }
        } else {
          addMove(defaultMove[0])
        }     
        
        //En passant
        if (coordinate[0] == 3 && pieceIsWhite) {
          let pawnLeft = [coordinate[0], coordinate[1] - 1]
          let pawnRight = [coordinate[0], coordinate[1] + 1]
  
          //We don't have to check if the square that the piece is moving to is empty because the black piece could not have moved there otherweise
  
          if (boardState[pawnLeft[0]][pawnLeft[1]] === ("♟")) {
            if (previousBoardState[moveCount - 1][1][pawnLeft[1]] === ("♟")) {
  
              let captureMove = [pawnLeft[0] + 1*multiplier, pawnLeft[1]]
              availableMovesArray.push(captureMove)
  
              let pawnToCapture = [pawnLeft[0], pawnLeft[1]]
              setEnpassant(() => {
                return {capture: pawnToCapture, count: structuredClone(moveCount), move: captureMove}
              })
  
            }
          }
          
          if (boardState[pawnRight[0]][pawnRight[1]] === ("♟")) {
            if (previousBoardState[moveCount - 1][1][pawnRight[1]] === ("♟")) {
  
              let captureMove = [pawnRight[0] + 1*multiplier, pawnRight[1]]
              availableMovesArray.push(captureMove)
  
              let pawnToCapture = [pawnRight[0], pawnRight[1]]
              setEnpassant(() => {
                return {capture: pawnToCapture, count: structuredClone(moveCount), move: captureMove}
              })
  
            }    
          }
        }
  
        if (coordinate[0] == 4 && !pieceIsWhite) {
  
          let pawnLeft = [coordinate[0], coordinate[1] - 1]
          let pawnRight = [coordinate[0], coordinate[1] + 1]
  
          if (boardState[pawnLeft[0]][pawnLeft[1]] === ("♙")) {
            if (previousBoardState[moveCount - 1][6][pawnLeft[1]] === ("♙")) {
              let captureMove = [pawnLeft[0] + 1*multiplier, pawnLeft[1]]
              availableMovesArray.push(captureMove)
  
              let pawnToCapture = [pawnLeft[0], pawnLeft[1]]
              setEnpassant(() => {
                return {capture: pawnToCapture, count: structuredClone(moveCount), move: captureMove}
              })
  
            }
          }
          
          if (boardState[pawnRight[0]][pawnRight[1]] === ("♙")) {
            if (previousBoardState[moveCount - 1][6][pawnRight[1]] === ("♙")) {
  
              let captureMove = [pawnRight[0] + 1*multiplier, pawnRight[1]]
              availableMovesArray.push(captureMove)
  
              let pawnToCapture = [pawnRight[0], pawnRight[1]]
              setEnpassant(() => {
                return {capture: pawnToCapture, count: structuredClone(moveCount), move: captureMove}
              })
  
            }    
          }
        
        }
  
          
      
  
      }
      //Knight
      if (piece == "♘" || piece == "♞") {
        let moves = [
          [1, 2],
          [-1, 2],
          [1, -2],
          [-1, -2],
          [2, 1],
          [-2, 1],
          [2, -1],
          [-2, -1]
        ]
  
        for (let i = 0; i < moves.length; i++) {
            let move = moves[i]
            addMove(move)   
        }
      }
      //Bishop
      if (piece == "♗" || piece == "♝") {
        let symbol = [
          [1, 1],
          [-1, 1],
          [-1, -1],
          [1, -1]
        ]
    
        //Up and left
        for (let j = 0; j < symbol.length; j++) {
          let currentSymbol = symbol[j]
          let add = true
          for (let i = 1; i < 9; i++) {
             add = addMove(currentSymbol, i)
             if (add === false) {
              add = true
              break
             }
          }
        }
      }
      //Rook
      if (piece == "♖" || piece == "♜") {
        let symbol = [
          [1, 0],
          [-1, 0],
          [0, -1],
          [0, 1]
        ]
    
        for (let j = 0; j < symbol.length; j++) {
          let currentSymbol = symbol[j]
          let add = true
          for (let i = 1; i < 9; i++) {
             add = addMove(currentSymbol, i)
             if (add === false) {
              add = true
              break
             }
          }
        }
      }
      //Queen
      if (piece == "♕" || piece == "♛") {
        let symbol = [
          [1, 0],
          [-1, 0],
          [0, -1],
          [0, 1],
          [1, 1],
          [-1, 1],
          [-1, -1],
          [1, -1]
        ]
    
        //Up and left
        for (let j = 0; j < symbol.length; j++) {
          let currentSymbol = symbol[j]
          let add = true
          for (let i = 1; i < 9; i++) {
             add = addMove(currentSymbol, i)
             if (add === false) {
              add = true
              break
             }
          }
        }
      }
      //King
      if (piece == "♔" || piece == "♚") {
        let moves = [
          [1, 0],
          [-1, 0],
          [0, -1],
          [0, 1],
          [1, 1],
          [-1, 1],
          [-1, -1],
          [1, -1]
        ]
  
        for (let i = 0; i < moves.length; i++) {
          let move = moves[i]
          addMove(move)        
        }
        
        //This adds the castle moves, but does not contribute to the attackMovesArray or the attackMap
        if (!attack) {
          let thisAttackMap = pieceIsWhite ? structuredClone(blackAttackMap) : structuredClone(whiteAttackMap)
          let movesToRemove = []
          
          //Adds moves which are in the attack map to the list of moves to remove
          for (let i = 0; i<availableMovesArray.length; i++) {
            let current_available_move = availableMovesArray[i]
            
            if (coordinateInAvaliableMoves(current_available_move, thisAttackMap)) {
              movesToRemove.push(current_available_move)
            }
          }
          //Removes those moves
          availableMovesArray = availableMovesArray.filter((e) => {
            if (!movesToRemove.includes(e)) {
              return e
            }
          })
          //-------------------------
  
          //Check if the king can castle, if the king can castle, add that to the available moves
          let canQueenCastle = true
          let canKingCastle = true
   
          let thisKingCastle = pieceIsWhite ? structuredClone(whiteCanCastle) : structuredClone(blackCanCastle)
          let row = pieceIsWhite ? 7 : 0
          let castleMoves = pieceIsWhite ? [[7, 2], [7, 6]] : [[0, 2], [0, 6]]
          let queenSquaresInTheWay = pieceIsWhite ? [[7, 1], [7, 2], [7, 3]] : [[0, 1], [0, 2], [0, 3]]
          let kingSquaresInTheWay = pieceIsWhite ? [[7, 5], [7, 6]] : [[0, 5], [0, 6]]
  
          // if any of the castle moves are attacked
          let attackMoves = thisAttackMap.filter((attackMove) => {
            if (attackMove[0] == row) {
              return attackMove
            }
          }) //List of all the attack moves on the first row of whoever's turn it is
  
          //Which side and if king is attacked
          for (let i = 0; i < attackMoves.length; i++) {
            let currentAttackMove = attackMoves[i]
            
            if (currentAttackMove[1] > 4) {
              canKingCastle = false
            }
            if (currentAttackMove[1] < 4) {
              canQueenCastle = false
            }
            if (currentAttackMove[1] == 4) {
              canQueenCastle = false
              canKingCastle = false
            }
          }
  
          //Are there pieces between the squares
          for (let i = 0; i < queenSquaresInTheWay.length; i++) {
            let queenSquare = queenSquaresInTheWay[i]
            let row = queenSquare[0]
            let col = queenSquare[1]
            if (boardState[row][col]) {
              canQueenCastle = false
              break
            }
          }
          for (let i = 0; i < kingSquaresInTheWay.length; i++) {
            let kingSquare = kingSquaresInTheWay[i]
            let row = kingSquare[0]
            let col = kingSquare[1]
            if (boardState[row][col]) {
              canKingCastle = false
              break
            }
          }
  
          //If the castle pieces have moved
          if (thisKingCastle.kingMoved == true) {
            canQueenCastle = false
            canKingCastle = false
          } 
          if (thisKingCastle.queenRookMoved == true) {
            canQueenCastle = false
          }       
          if (thisKingCastle.kingRookMoved == true) {
            canKingCastle = false 
          }
          // At this point we know:
            // If either the king side or queen side is attacked
            // If the king is attacked
            // If there is a piece contained in any of the squares between
            // If any of the pieces involved in castling have moved
          let queenCastleMoves = structuredClone(castleMoves[0])
          let kingCastleMoves = structuredClone(castleMoves[1])
  
          if (canKingCastle == true) {
            availableMovesArray.push([kingCastleMoves[0], kingCastleMoves[1]])
          }
          if (canQueenCastle == true) {
            availableMovesArray.push([queenCastleMoves[0], queenCastleMoves[1]])
          }
        }
      }
      
    }

    generateMoveList()


    function kingCheck(boardstate = trialBoardState) {
     
      let getKingPosition = () => {
        let position = []
        let currentKing = pieceIsWhite ? "♔" : "♚"
        for (let i=0; i<8; i++) {
          let row = i
          let currentRow = boardstate[i]
          let col = currentRow.indexOf(currentKing)
          if (col !== -1) {
            position = [row, col]
            return position
          }
        }
        console.log("guh")
      }

      let kingPosition = getKingPosition()
      let kingUnderCheck = false
      let currentCoordinate = structuredClone(kingPosition)
      let multiplier = pieceIsWhite ? -1 : 1

      const moves = {
        rook: [
          [1, 0],
          [-1, 0],
          [0, -1],
          [0, 1]
        ],
        bishop: [
          [1, 1],
          [-1, 1],
          [-1, -1],
          [1, -1]
        ],
        knight: [
          [1, 2],
          [-1, 2],
          [1, -2],
          [-1, -2],
          [2, 1],
          [-2, 1],
          [2, -1],
          [-2, -1]
        ],
        pawn: [
          [1*multiplier, 1],
          [1*multiplier, -1]
        ]
      }

      let opponentRook = pieceIsWhite ? "♜" : "♖"
      let opponentBishop = pieceIsWhite ? "♝" : "♗"
      let opponentKnight = pieceIsWhite ? "♞" : "♘"
      let opponentQueen = pieceIsWhite ? "♛" : "♕"
      let opponentPawn = pieceIsWhite ? "♟" : "♙"
      let ownPieces = pieceIsWhite ? ["♙", "♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"] : ["♟", "♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"]
      let coor = 0
      let row = 0
      let col = 0

      

      //Rook
      for (let i=0; i<moves.rook.length; i++) {
        coor = moves.rook[i]
        row = coor[0]
        col = coor[1]

        for (let j=0; j<8; j++) {
          currentCoordinate[0] = currentCoordinate[0] + row
          currentCoordinate[1] = currentCoordinate[1] + col

          if (!coordinateExists(currentCoordinate[0], currentCoordinate[1])) {
            break
          }

          let currentPiece = boardstate[currentCoordinate[0]][currentCoordinate[1]]

          if (currentPiece && (currentPiece === opponentRook || currentPiece === opponentQueen)) {
            kingUnderCheck = true
            console.log(currentPiece)
            break
          }
          if (ownPieces.includes(currentPiece)) {
            break
          }
        }
        currentCoordinate = structuredClone(kingPosition)
      }

      //Bishop
      for (let i=0; i<moves.bishop.length; i++) {
        coor = moves.bishop[i]
        row = coor[0]
        col = coor[1]

        for (let j=0; j<8; j++) {
          currentCoordinate[0] = currentCoordinate[0] + row
          currentCoordinate[1] = currentCoordinate[1] + col

          if (!coordinateExists(currentCoordinate[0], currentCoordinate[1])) {
            break
          }

          let currentPiece = boardstate[currentCoordinate[0]][currentCoordinate[1]]
          
          if (currentPiece && (currentPiece === opponentBishop || currentPiece === opponentQueen)) {
            kingUnderCheck = true
            break
          }

          if (ownPieces.includes(currentPiece)) {
            break
          }
        }
        currentCoordinate = structuredClone(kingPosition)
      }

      //Pawn
      for (let i=0; i<moves.pawn.length; i++) {
        coor = moves.pawn[i]
        row = coor[0]
        col = coor[1]

        if (!coordinateExists(row, col)) {
          break
        }
        
        let currentPiece = boardstate[row][col]

        if (currentPiece && (currentPiece === opponentPawn)) {
          kingUnderCheck = true
        }
      }

      //Knight
      for (let i=0; i<moves.knight.length; i++) {
        coor = moves.knight[i]
        row = coor[0]
        col = coor[1]

        if (!coordinateExists(row, col)) {
          break
        }
        
        let currentPiece = boardstate[row][col]

        if (currentPiece && (currentPiece === opponentKnight)) {
          kingUnderCheck = true
        }
      }

      return kingUnderCheck

    }

    //Removing moves that put the king under check

    if (!attack) {
      let checkAvailableMoves = []
      for (let i=0; i<availableMovesArray.length; i++) {
        //Initialize boardstate clone
        //modify boardstate clone
        //pass boardstate clone through kingCheck() function
        //if it returns true, remove that element from the available moves
  
        let currentCoordinate = availableMovesArray[i]
  
        let checkBoardState = structuredClone(boardState)
  
        checkBoardState[coordinate[0]][coordinate[1]] = null
        checkBoardState[currentCoordinate[0]][currentCoordinate[1]] = piece

        console.log(checkBoardState)
  
        if (!kingCheck(checkBoardState)) {
          checkAvailableMoves.push([currentCoordinate[0], currentCoordinate[1]])
        }
        // checkBoardState[currentCoordinate[0]][currentCoordinate[1]] = null
      }
  
      availableMovesArray = structuredClone(checkAvailableMoves)
    }


    if (attack) {
      return attackMovesArray
    }

    return availableMovesArray
  }

  //Moves that don't put your king in check
  function trueAvailableMoves(movesArr, coordinate) {
    let trueMoves = structuredClone(movesArr)
    console.log(coordinate)

    return trueMoves
  }

  //Return Linear index of coordinates and the color array
  function convertCoordinates(availableMovesArray) {
  let convertedCoordinates = []
  let color_arr = colors
  //convert coordinates
  
  //No moves made
  if (availableMovesArray == null) {
    let color_arr = []
    let boardSize = 8;
    let isBlack = false;
    
    for (let i = 0; i < boardSize * boardSize; i++) {
      if (isBlack) {
        color_arr.push("bg-gray-400");
      } else {
        color_arr.push("bg-gray-100");
      }
      isBlack = !isBlack;
      if ((i + 1) % boardSize === 0) {
        isBlack = !isBlack;
      }
    }
    return color_arr
  }

  //Move made
  for (let i = 0; i < availableMovesArray.length; i++) {

    let move = availableMovesArray[i]
    let newNum = 8*move[0] + move[1]

    convertedCoordinates.push(newNum)
  }
  //modify color_arr
  for (let i = 0; i < convertedCoordinates.length; i++) {
    let yellowCoordinate = convertedCoordinates[i]
    color_arr[yellowCoordinate] = "bg-yellow-300"
  }

  return color_arr
  }

  //When one of the pieces is clicked, use the state of the pawnToChange object to make the changes
  function changePawnClick(id) {
    if (pawnToChange.pawnToChange === false) {
      return
    }
    let piece = isWhiteTurn ? pawnWhitePieces[id] : pawnBlackPieces[id]
    let initialCoordinate = structuredClone(pawnToChange.previousCoordinate)
    let finalCoordinate = structuredClone(pawnToChange.coordinate)
    let changeBoardState = structuredClone(trialBoardState)


    //Moves the pawn with the new piece in it's place
    changeBoardState[initialCoordinate[0]][initialCoordinate[1]] = null
    changeBoardState[finalCoordinate[0]][finalCoordinate[1]] = piece

    setPawnToChange({pawnToChange: false, coordinate: [], previousCoordinate: []})

    setisWhiteTurn(!isWhiteTurn)
    setMoveCount(moveCount+1)
    
    setColors(convertCoordinates(null))
    setFirstClick(null)

    setAttackMap(changeBoardState)
    setTrialBoardState(changeBoardState)

  }

  //Return if the Move at the current coordinate is Valid
  function isValidMove(coordinate) {
    
    let isValid = true
    let availableMoves = []


    if ((coordinate[0] === firstClick[0]) && (coordinate[1] === firstClick[1])) {
      isValid = false
      return isValid;
    }

    //Check if a coordinate is in a list of available moves
    availableMoves = trueAvailableMoves(currentAvailableMoves(firstClick), firstClick)
    isValid = coordinateInAvaliableMoves(coordinate, availableMoves)

    return isValid;
  }

  //Update board state
  function updateBoard(position) {

    //The position is the linear index of the square
    let coordinate = [Math.floor(position/8), position%8]

    let blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"]

    //If there is a pawn To change, don't do anything...
    if (pawnToChange.pawnToChange) {
      console.log("piece to be selected")
      return
    }

    
    function updateKingPositions() {
      //White king
      if (piece_name === "♔") {
        setWhiteKing({position: [coordinate[0], coordinate[1]], hasMoved: true, isChecked: false, castleSquaresAttacked: false})
      }
      //Black King
      if (piece_name === "♚") {
        setBlackKing({position: [coordinate[0], coordinate[1]], hasMoved: true, isChecked: false, castleSquaresAttacked: false})
      }
    }


    setAttackMap(trialBoardState)
    
    // Adds first click
    if (!firstClick) {
      //If there is a piece
      if (trialBoardState[coordinate[0]][coordinate[1]]) {
        //Checks color of piece
        
        let pieceIsWhite = true
        if (blackPieces.includes(trialBoardState[coordinate[0]][coordinate[1]])) {
          pieceIsWhite = false
        }
        //If the color of the piece matches the turn
        if (isWhiteTurn === pieceIsWhite) {
          //Set the first click and display the available moves
          setFirstClick(coordinate)
          convertCoordinates(trueAvailableMoves(currentAvailableMoves(coordinate), coordinate))   
        }
        return
      } 
      return
    }

    let pieceIsWhite = true
    if (blackPieces.includes(trialBoardState[coordinate[0]][coordinate[1]])) {
      pieceIsWhite = false
    }
    let piece_name = trialBoardState[firstClick[0]][firstClick[1]]
    //duplicate current board state onto ChangeBoardState
    let changeBoardState = structuredClone(trialBoardState)

    function movePiece(piece, newSquare, oldSquare) {
      changeBoardState[newSquare[0]][newSquare[1]] = piece
      changeBoardState[oldSquare[0]][oldSquare[1]] = null
    }

    //If the move is valid Modify board state
    if (isValidMove(coordinate, piece_name)) {

      //If the current coordinate was an enpassant move
      if ((coordinate[0] === enpassant.move[0]) && (coordinate[1] === enpassant.move[1])) {


        let currentRow = enpassant.capture[0]
        let currentCol = enpassant.capture[1]


        changeBoardState[coordinate[0]][coordinate[1]] = piece_name
        changeBoardState[firstClick[0]][firstClick[1]] = null

        changeBoardState[currentRow][currentCol] = null
        
        setEnpassant({capture: [null, null], count: null, move: [null, null]})
        setColors(convertCoordinates(null))
        setFirstClick(null)

        setisWhiteTurn(!isWhiteTurn)
        setMoveCount(moveCount+1)
  
        setAttackMap(changeBoardState)
        setTrialBoardState(changeBoardState)

        return
      }

      //If the current coordinate was a pawn reaching the end of the board
      if ((piece_name == "♙" || piece_name == "♟") && (coordinate[0] === 7 || coordinate[0] === 0)) {
        setPawnToChange({pawnToChange: true, coordinate: structuredClone(coordinate), previousCoordinate: structuredClone(firstClick)})
        return
      }

      //If the current piece is one of the pieces involved in castling
      if ((piece_name == "♖" || piece_name == "♜" || piece_name == "♔" || piece_name == "♚")) {
        //This is only meant to update the classes for castling (whiteCanCastle and blackCanCastle)
        //We do the check for the attack map in the available moves function 
        if (firstClick[0] == 0 && firstClick[1] == 0) {
          //Black queen's rook
          setBlackCanCastle((prev) => ({...prev, queenRookMoved: true}))
        }
        if (firstClick[0] == 0 && firstClick[1] == 7) {
          //Black king's rook
          setBlackCanCastle((prev) => ({...prev, kingRookMoved: true}))
        }
        if (firstClick[0] == 0 && firstClick[1] == 4) {
          //Black king
          setBlackCanCastle((prev) => ({...prev, kingMoved: true}))
        }
        if (firstClick[0] == 7 && firstClick[1] == 0) {
          //White queen's rook
          setWhiteCanCastle((prev) => ({...prev, queenRookMoved: true}))
        }
        if (firstClick[0] == 7 && firstClick[1] == 7) {
          //white king's rook
          setWhiteCanCastle((prev) => ({...prev, kingRookMoved: true}))
        }
        if (firstClick[0] == 7 && firstClick[1] == 4) {
          //Black white king
          setWhiteCanCastle((prev) => ({...prev, kingMoved: true}))
        }
      }

      //if castle move, move the rook to it's appropriate place
      if ((piece_name == "♔" || piece_name == "♚") && (coordinate[1] == firstClick[1] + 2 || coordinate[1] == firstClick[1] - 2)) {
        let rookColor = isWhiteTurn ? "♖" : "♜"
        let currentRookQoordinate = []
        let newRookQoordinate = []
        //if the current click is on the king side
        if (coordinate[1] == 6) {
          currentRookQoordinate = [structuredClone(coordinate[0]), 7] 
          newRookQoordinate = [structuredClone(coordinate[0]), 5]
        }
        if (coordinate[1] == 2) {
          currentRookQoordinate = [structuredClone(coordinate[0]), 0] 
          newRookQoordinate = [structuredClone(coordinate[0]), 3]
        }

        movePiece(rookColor, newRookQoordinate, currentRookQoordinate)

      }
      

      movePiece(piece_name, coordinate, firstClick)


      updateKingPositions()
      setisWhiteTurn(!isWhiteTurn)
      setMoveCount(moveCount+1)
      

      setColors(convertCoordinates(null))
      setFirstClick(null)

      setAttackMap(changeBoardState)
      setTrialBoardState(changeBoardState)
      

    } else {
      setColors(convertCoordinates(null))
      setFirstClick(null)
    }
}

  return (
    <>
      <div className='grid grid-cols-8 w-80 border border-black'>        
        {colors.map((e, idx) => 
          (<Square 
            color={e} id={ids[idx]} 
            updateBoard={() => updateBoard(ids[idx])} 
            piece={trialBoardState[Math.floor(idx/8)][idx%8]}/>)
        )}
      </div>

      {/*Render this div only if there is a pawn to change */}
      {pawnToChange.pawnToChange && 
      <div className='flex flex-row justify-end h-10'>        
        {changePawnColors.map((e, idx) => 
          (<Square 
            color={e} id={ids[idx]}
            updateBoard={() => changePawnClick(ids[idx])}
            piece={isWhiteTurn ? pawnWhitePieces[idx] : pawnBlackPieces[idx]}/>)
        )}
      </div>}

    </>
  )
}



function Square({color, id, piece, updateBoard}) {
  
  return (
    <>
      <div className={`w-10 h-10 ${color} grid place-items-center text-2xl font-serif border border-2`} onClick={updateBoard}>
          {piece}
      </div>
    </>
  )
}

export default App
