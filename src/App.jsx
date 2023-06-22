import { useState, useEffect } from 'react'
import { CurrentPiece } from "./CurrentPiece.jsx"



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


  // useEffect(() => {
  //   setAttackMap()
  // }, [firstClick])

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

  function kingUnderCheck() {
    if (coordinateInAvaliableMoves(whiteKing.position, blackAttackMap)) {
      console.log("white King is under check")
    }
    if (coordinateInAvaliableMoves(blackKing.position, whiteAttackMap)) {
      console.log("Black King is under check")
    }
  }

  //Check if a coordinate is in a list of available moves
  function coordinateInAvaliableMoves(coordinate, availableMoves) {
    let value = availableMoves.some((a) => a.every((v, i) => v === coordinate[i])); // if it works it works   
    return value 
  }

  //Spagetti spagetti spagetti
  function setAttackMap() {
    let blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"]
    let whitePieces = ["♙","♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]

    let blackAttackMap = []
    let whiteAttackMap = []
    let blackPieceCoordinates = []
    let whitePieceCoordinates = []


    //Fetch coordinates of white and black pieces
    for (let row = 0; row < trialBoardState.length; row++) {
      for (let col = 0; col < trialBoardState[0].length; col++) {
        if (blackPieces.includes(trialBoardState[row][col])) {
          blackPieceCoordinates.push([row, col])
        }
        if (whitePieces.includes(trialBoardState[row][col])) {
          whitePieceCoordinates.push([row, col])
        }
      }
    }
    
    //Creating black Attack Map
    for (let i = 0; i < blackPieceCoordinates.length; i++) {
      let current_coordinate = blackPieceCoordinates[i]
      let current_list = currentAvailableMoves(current_coordinate, true) //Attack moves "true"
      if (current_list) {
        for (let j = 0; j < current_list.length; j++) {
          blackAttackMap.push(current_list[j])
        }
      }
    }

    //White Attack Map
    for (let i = 0; i < whitePieceCoordinates.length; i++) {
      let current_coordinate = whitePieceCoordinates[i]
      let current_list = currentAvailableMoves(current_coordinate, true)
      if (current_list) {
        for (let j = 0; j < current_list.length; j++) {
          whiteAttackMap.push(current_list[j])
        }
      }
    }

    setBlackAttackMap(blackAttackMap)
    setWhiteAttackMap(whiteAttackMap)
  }
  
  //Return List of available moves
  function currentAvailableMoves(coordinate, attack) {
    let blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"]
    let whitePieces = ["♙", "♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]

    let availableMovesArray = []
    let attackMovesArray = []
    let pieceIsWhite = true
    let piece = null

    if (Array.isArray(coordinate)) {
      piece = trialBoardState[coordinate[0]][coordinate[1]]
    }
    //Is current piece white
    if (blackPieces.includes(piece)) {
      pieceIsWhite = false
    }

    function samePiece(current_row, current_col) {
      //This function works
      let newPiece = trialBoardState[current_row][current_col]
      let newPieceIsWhite = whitePieces.includes(newPiece) 
      return(newPieceIsWhite === pieceIsWhite)
    }
    
    function coordinateExists(newRow, newCol) {
      let exists = typeof trialBoardState[newRow] !== 'undefined' && typeof trialBoardState[newRow][newCol] !== 'undefined'
      return exists
    }
    //appends attackMovesArray and availableMoves conditionally
    function addMove(move, scale) {
      let add = true
      if (!scale) {
        scale = 1
      }
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
          if (trialBoardState[newRow][newCol]) {
            add = false
          }
        }

        if (move[1]**2 === 1) {
          attackMovesArray.push([newRow, newCol]) //Attack map
          //if the square is empty or contains a piece of the same color
          if (!trialBoardState[newRow][newCol] || (trialBoardState[newRow][newCol] && samePiece(newRow, newCol))) {
            add = false
          }
        }

        if (add) {
          availableMovesArray.push([newRow, newCol])
        }
        return add
      }

      //If You want the itteration to stop after a piece has blocked the path
      if (trialBoardState[newRow][newCol]) {
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

        if (trialBoardState[pawnLeft[0]][pawnLeft[1]] === ("♟")) {
          if (previousBoardState[moveCount - 1][1][pawnLeft[1]] === ("♟")) {

            let captureMove = [pawnLeft[0] + 1*multiplier, pawnLeft[1]]
            availableMovesArray.push(captureMove)

            let pawnToCapture = [pawnLeft[0], pawnLeft[1]]
            setEnpassant(() => {
              return {capture: pawnToCapture, count: structuredClone(moveCount), move: captureMove}
            })

          }
        }
        
        if (trialBoardState[pawnRight[0]][pawnRight[1]] === ("♟")) {
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

        if (trialBoardState[pawnLeft[0]][pawnLeft[1]] === ("♙")) {
          if (previousBoardState[moveCount - 1][6][pawnLeft[1]] === ("♙")) {
            let captureMove = [pawnLeft[0] + 1*multiplier, pawnLeft[1]]
            availableMovesArray.push(captureMove)

            let pawnToCapture = [pawnLeft[0], pawnLeft[1]]
            setEnpassant(() => {
              return {capture: pawnToCapture, count: structuredClone(moveCount), move: captureMove}
            })

          }
        }
        
        if (trialBoardState[pawnRight[0]][pawnRight[1]] === ("♙")) {
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
    }

    if (attack) {
      return attackMovesArray
    }

    return availableMovesArray
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

  //Return if the Move at the current coordinate is Valid
  function isValidMove(coordinate) {
    
    let isValid = true
    let availableMoves = []

    if ((coordinate[0] === firstClick[0]) && (coordinate[1] === firstClick[1])) {
      isValid = false
      return isValid;
    }

    //Check if a coordinate is in a list of available moves
    availableMoves = currentAvailableMoves(firstClick)
    isValid = coordinateInAvaliableMoves(coordinate, availableMoves)

      return isValid;
}

  //Update board state
  function updateBoard(position) {

    let coordinate = [Math.floor(position/8), position%8]

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
    
    // Checks if firstClick is empty 
    if (!firstClick) {
      if (trialBoardState[coordinate[0]][coordinate[1]]) {

        setFirstClick(coordinate)
        convertCoordinates(currentAvailableMoves(coordinate))   
        return
      } 
      return
    }

    //If the move is valid Modify board state
    let piece_name = trialBoardState[firstClick[0]][firstClick[1]]
    
    if (isValidMove(coordinate, piece_name)) {
      
      setTrialBoardState((prev) =>{
        //duplicate current board state onto ChangeBoardState
        let changeBoardState = structuredClone(prev)

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

          return changeBoardState
        }

        changeBoardState[coordinate[0]][coordinate[1]] = piece_name
        changeBoardState[firstClick[0]][firstClick[1]] = null
        
        setisWhiteTurn(!isWhiteTurn)
        setMoveCount(moveCount+1)
        updateKingPositions()

        setColors(convertCoordinates(null))
        setFirstClick(null)

        return changeBoardState
      })

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
            color={e} id={ids[idx]} updateBoard={() => updateBoard(ids[idx])} piece={trialBoardState[Math.floor(idx/8)][idx%8]}/>)
        )}
      </div>
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
