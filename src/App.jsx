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
      <div className='flex justify-center mt-32 bg-gray-200'>
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
  const [enpassant, setEnpassant] = useState(null)

  function deepcopy(object) { 
    return JSON.parse(JSON.stringify(object)) //WTF
  }
  useEffect(() => {
    if (moveCount === 0) {
      return
    }
    setPreviousBoardState((prev) => {
      let newState = [...prev]
      newState.push(deepcopy(trialBoardState))
      return newState
    })
  }, [moveCount])


  //Return List of available moves
  function currentAvailableMoves(coordinate) {
    
    let piece = trialBoardState[coordinate[0]][coordinate[1]]
    let availableMovesArray = []
    let blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"]
    let whitePieces = ["♙", "♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
    let pieceIsWhite = true

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
  
    //Pieces
    //White Pawn
    if (piece == "♙" || piece == "♟") {
      let availableMoves = []
      let multiplier = pieceIsWhite ? -1 : 1

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
        let newRow = coordinate[0] + captureMove[0]
        let newCol = coordinate[1] + captureMove[1]

        if (trialBoardState[newRow][newCol]) {
          if (!samePiece(newRow, newCol)) {
            availableMoves.push([newRow, newCol])
          }
        }
      }


      //The first move
      if ((coordinate[0] == 6 && pieceIsWhite) || coordinate[0] == 1 && !pieceIsWhite) {
      
        //Add normal Moves
        for (let i = 0; i < moves.length; i++) {
          let move = moves[i]
          let newRow = coordinate[0] + move[0]
          let newCol = coordinate[1] + move[1]

          if (trialBoardState[newRow][newCol]) {
            break
          }
          availableMoves.push([newRow, newCol])
            
          }
        } else {
          let newRow = coordinate[0] + 1*multiplier
          let newCol = coordinate[1]
          if (!trialBoardState[newRow][newCol]) {
            availableMoves.push([newRow, newCol])
          }
        }
      
      //En passant
      if ((coordinate[0] == 3 && pieceIsWhite) || coordinate[0] == 4 && !pieceIsWhite) {
        let pawnLeft = [coordinate[0], coordinate[1] - 1]
        let pawnRight = [coordinate[0], coordinate[1] + 1]

        if (trialBoardState[pawnLeft[0]][pawnLeft[1]] === ("♟")) {
          if (previousBoardState[moveCount - 1][1][pawnLeft[1]] === ("♟")) {
            availableMoves.push([pawnLeft[0] + 1*multiplier], pawnLeft[1])
          }
        }
        
        if (trialBoardState[pawnRight[0]][pawnRight[1]] === ("♟")) {
          if (previousBoardState[moveCount - 1][1][pawnRight[1]] === ("♟")) {
            availableMoves.push([pawnRight[0] + 1*multiplier, pawnRight[1]])
          }    
        }
        

      }



        availableMovesArray = availableMoves
        
        //Pawn capturing

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
      let availableMoves = []

      for (let i = 0; i < moves.length; i++) {
          let move = moves[i]
          let newRow = coordinate[0] + move[0]
          let newCol = coordinate[1] + move[1]
          if (typeof trialBoardState[newRow] !== 'undefined' && typeof trialBoardState[newRow][newCol] !== 'undefined') {
            if (trialBoardState[newRow][newCol]) {
              if (samePiece(newRow, newCol)) {
                continue
              }
            }
            availableMoves.push([newRow, newCol])
          }
        
      }
      availableMovesArray = availableMoves
    }
    //Bishop
    if (piece == "♗" || piece == "♝") {
      let availableMoves = []
      let symbol = [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1]
      ]
  
      //Up and left
      for (let j = 0; j < symbol.length; j++) {
        let currentSymbol = symbol[j]

        for (let i = 1; i < 9; i++) {
            let newRow = coordinate[0] + (i*currentSymbol[0])
            let newCol = coordinate[1] + (i*currentSymbol[1])

            //Check if the square is on the Board
            if (!(typeof trialBoardState[newRow] !== 'undefined' && typeof trialBoardState[newRow][newCol] !== 'undefined')) {
              break
            }
            //Check if the square contains a piece of the same color
            if (trialBoardState[newRow][newCol]) {
              if (!samePiece(newRow, newCol)) {
                availableMoves.push([newRow, newCol])
              }
              break
            }
            //Check if index exists
            availableMoves.push([newRow, newCol])
          }
      }
    
      availableMovesArray = availableMoves
    }
    //Rook
    if (piece == "♖" || piece == "♜") {
      let availableMoves = []
      let symbol = [
        [1, 0],
        [-1, 0],
        [0, -1],
        [0, 1]
      ]
  
      //Up and left
      for (let j = 0; j < symbol.length; j++) {
        let currentSymbol = symbol[j]

        for (let i = 1; i < 9; i++) {
            let newRow = coordinate[0] + (i*currentSymbol[0])
            let newCol = coordinate[1] + (i*currentSymbol[1])
      
            if (!(typeof trialBoardState[newRow] !== 'undefined' && typeof trialBoardState[newRow][newCol] !== 'undefined')) {
              break
            }
            if (trialBoardState[newRow][newCol]) {
              if (!samePiece(newRow, newCol)) {
                availableMoves.push([newRow, newCol])
              }
              break
            }
            //Check if index exists
            availableMoves.push([newRow, newCol])
          }
      }
    
      availableMovesArray = availableMoves
    }
    //Queen
    if (piece == "♕" || piece == "♛") {
      let availableMoves = []
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

        for (let i = 1; i < 9; i++) {
            let newRow = coordinate[0] + (i*currentSymbol[0])
            let newCol = coordinate[1] + (i*currentSymbol[1])

            if (!(typeof trialBoardState[newRow] !== 'undefined' && typeof trialBoardState[newRow][newCol] !== 'undefined')) {
              break
            }
            if (trialBoardState[newRow][newCol]) {
              if (!samePiece(newRow, newCol)) {
                availableMoves.push([newRow, newCol])
              }
              break
            }
            //Check if index exists
            availableMoves.push([newRow, newCol])
          }
      }
    
      availableMovesArray = availableMoves
    }
    //King
    if (piece == "♔" || piece == "♚") {
      let availableMoves = []
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
      for (let j = 0; j < symbol.length; j++) {
        let currentSymbol = symbol[j]

        for (let i = 1; i < 2; i++) {
            let newRow = coordinate[0] + (i*currentSymbol[0])
            let newCol = coordinate[1] + (i*currentSymbol[1])
           
            if (!(typeof trialBoardState[newRow] !== 'undefined' && typeof trialBoardState[newRow][newCol] !== 'undefined')) {
              break
            }

            if (trialBoardState[newRow][newCol]) {
              if (samePiece(newRow, newCol)) {
                continue
              }
            }
            availableMoves.push([newRow, newCol])
          }
          
      }
    
      availableMovesArray = availableMoves
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

  //Function to return a List of available moves when a piece is clicked
  //This function needs to only return the array of available moves because that does not depend on the coordinate of the second click

  function isValidMove(coordinate) {
    
    let isValid = true
    let availableMoves = []

    //Check if a coordinate is in a list of available moves
    function coordinateInAvaliableMoves(coordinate, availableMoves) {
      isValid = availableMoves.some((a) => a.every((v, i) => v === coordinate[i])); // if it works it works
    }

    availableMoves = currentAvailableMoves(firstClick)
    coordinateInAvaliableMoves(coordinate, availableMoves)

      return isValid;
    }

  
  //Update board state
  function updateBoard(position) {

    let coordinate = [Math.floor(position/8), position%8]
    
    
    // Checks if firstClick is empty 
    if (!firstClick) {
      if (trialBoardState[coordinate[0]][coordinate[1]]) {

        setFirstClick(coordinate)
        convertCoordinates(currentAvailableMoves(coordinate))   
        return
      } 
      return
    }

    let piece_name = trialBoardState[firstClick[0]][firstClick[1]]



    if (isValidMove(coordinate, piece_name)) {
      setTrialBoardState((prev) =>{
        let changeBoardState = prev.slice()

        changeBoardState[coordinate[0]][coordinate[1]] = piece_name
        changeBoardState[firstClick[0]][firstClick[1]] = null
        
        setisWhiteTurn(!isWhiteTurn)
        setMoveCount(moveCount+1)

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
