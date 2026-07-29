import { useEffect, useCallback } from 'react'
import { useState } from 'react'
import './App.css'

const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => (b === 0 ? NaN : a / b),
}

function formatDisplay(value) {
  if (Number.isNaN(value)) return 'Oops!'
  const str = String(value)
  return str.length > 9 ? Number(value).toExponential(3) : str
}

function App() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [prevValue, setPrevValue] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const clearAll = useCallback(() => {
    setDisplay('0')
    setExpression('')
    setPrevValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }, [])

  const inputDigit = useCallback(
    (digit) => {
      if (waitingForOperand) {
        setDisplay(digit)
        setWaitingForOperand(false)
        if (operator === null) setExpression('')
      } else {
        setDisplay(display === '0' ? digit : display + digit)
      }
    },
    [display, operator, waitingForOperand],
  )

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      if (operator === null) setExpression('')
      return
    }
    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }, [display, operator, waitingForOperand])

  const backspace = useCallback(() => {
    if (waitingForOperand) return
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'))
  }, [waitingForOperand])

  const toggleSign = useCallback(() => {
    setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : prev === '0' ? prev : '-' + prev))
  }, [])

  const inputPercent = useCallback(() => {
    setDisplay((prev) => formatDisplay(parseFloat(prev) / 100))
  }, [])

  const performOperation = useCallback(
    (nextOperator) => {
      const inputValue = parseFloat(display)
      let base = inputValue

      if (prevValue === null) {
        setPrevValue(inputValue)
      } else if (operator) {
        const result = OPERATORS[operator](prevValue, inputValue)
        base = result
        setPrevValue(result)
        setDisplay(formatDisplay(result))
      }

      setExpression(`${formatDisplay(base)} ${nextOperator}`)
      setWaitingForOperand(true)
      setOperator(nextOperator)
    },
    [display, operator, prevValue],
  )

  const handleEquals = useCallback(() => {
    if (operator === null || prevValue === null) return
    const inputValue = parseFloat(display)
    const result = OPERATORS[operator](prevValue, inputValue)
    setExpression(`${formatDisplay(prevValue)} ${operator} ${formatDisplay(inputValue)} =`)
    setDisplay(formatDisplay(result))
    setPrevValue(null)
    setOperator(null)
    setWaitingForOperand(true)
  }, [display, operator, prevValue])

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event
      if (key >= '0' && key <= '9') {
        inputDigit(key)
      } else if (key === '.') {
        inputDecimal()
      } else if (key === '+' || key === '-') {
        performOperation(key)
      } else if (key === '*') {
        performOperation('×')
      } else if (key === '/') {
        event.preventDefault()
        performOperation('÷')
      } else if (key === 'Enter' || key === '=') {
        handleEquals()
      } else if (key === 'Backspace') {
        backspace()
      } else if (key === 'Escape') {
        clearAll()
      } else if (key === '%') {
        inputPercent()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inputDigit, inputDecimal, performOperation, handleEquals, backspace, clearAll, inputPercent])

  return (
    <div className="calculator">
      <div className="calculator-display">
        <div className="calculator-expression">{expression || ' '}</div>
        <div className="calculator-result">{display}</div>
      </div>
      <div className="calculator-keys">
        <button className="key key-function" onClick={clearAll}>C</button>
        <button className="key key-function" onClick={toggleSign}>+/-</button>
        <button className="key key-function" onClick={inputPercent}>%</button>
        <button className="key key-operator" onClick={() => performOperation('÷')}>÷</button>

        <button className="key" onClick={() => inputDigit('7')}>7</button>
        <button className="key" onClick={() => inputDigit('8')}>8</button>
        <button className="key" onClick={() => inputDigit('9')}>9</button>
        <button className="key key-operator" onClick={() => performOperation('×')}>×</button>

        <button className="key" onClick={() => inputDigit('4')}>4</button>
        <button className="key" onClick={() => inputDigit('5')}>5</button>
        <button className="key" onClick={() => inputDigit('6')}>6</button>
        <button className="key key-operator" onClick={() => performOperation('-')}>-</button>

        <button className="key" onClick={() => inputDigit('1')}>1</button>
        <button className="key" onClick={() => inputDigit('2')}>2</button>
        <button className="key" onClick={() => inputDigit('3')}>3</button>
        <button className="key key-operator" onClick={() => performOperation('+')}>+</button>

        <button className="key key-zero" onClick={() => inputDigit('0')}>0</button>
        <button className="key" onClick={inputDecimal}>.</button>
        <button className="key key-function" onClick={backspace}>⌫</button>
        <button className="key key-equals" onClick={handleEquals}>=</button>
      </div>
    </div>
  )
}

export default App
