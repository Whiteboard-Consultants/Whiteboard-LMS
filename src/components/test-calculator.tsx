'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Delete, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalculatorState {
  display: string;
  memory: number;
  previousValue: number | null;
  operation: string | null;
  newNumber: boolean;
}

export function TestCalculator() {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    memory: 0,
    previousValue: null,
    operation: null,
    newNumber: true,
  });

  const updateDisplay = (value: string) => {
    setState(prev => ({
      ...prev,
      display: value
    }));
  };

  const handleNumber = (num: string) => {
    setState(prev => {
      if (prev.newNumber) {
        return {
          ...prev,
          display: num,
          newNumber: false,
        };
      }
      return {
        ...prev,
        display: prev.display === '0' ? num : prev.display + num,
        newNumber: false,
      };
    });
  };

  const handleDecimal = () => {
    setState(prev => {
      if (prev.newNumber) {
        return {
          ...prev,
          display: '0.',
          newNumber: false,
        };
      }
      if (!prev.display.includes('.')) {
        return {
          ...prev,
          display: prev.display + '.',
          newNumber: false,
        };
      }
      return prev;
    });
  };

  const handleOperation = (op: string) => {
    setState(prev => {
      const currentValue = parseFloat(prev.display);
      
      if (prev.previousValue !== null && prev.operation && !prev.newNumber) {
        const result = calculate(prev.previousValue, currentValue, prev.operation);
        return {
          ...prev,
          display: formatNumber(result),
          previousValue: result,
          operation: op,
          newNumber: true,
        };
      }
      
      return {
        ...prev,
        previousValue: currentValue,
        operation: op,
        newNumber: true,
      };
    });
  };

  const calculate = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        return current !== 0 ? prev / current : 0;
      case '%':
        return prev % current;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    setState(prev => {
      if (prev.previousValue !== null && prev.operation) {
        const currentValue = parseFloat(prev.display);
        const result = calculate(prev.previousValue, currentValue, prev.operation);
        return {
          ...prev,
          display: formatNumber(result),
          previousValue: null,
          operation: null,
          newNumber: true,
        };
      }
      return prev;
    });
  };

  const handleClear = () => {
    setState({
      display: '0',
      memory: 0,
      previousValue: null,
      operation: null,
      newNumber: true,
    });
  };

  const handleBackspace = () => {
    setState(prev => {
      if (prev.newNumber) return prev;
      const newDisplay = prev.display.slice(0, -1) || '0';
      return {
        ...prev,
        display: newDisplay,
      };
    });
  };

  const handleToggleSign = () => {
    setState(prev => {
      const value = parseFloat(prev.display);
      return {
        ...prev,
        display: formatNumber(-value),
      };
    });
  };

  const handleSquareRoot = () => {
    setState(prev => {
      const value = parseFloat(prev.display);
      const result = Math.sqrt(value);
      return {
        ...prev,
        display: formatNumber(result),
        newNumber: true,
      };
    });
  };

  const handleReciprocal = () => {
    setState(prev => {
      const value = parseFloat(prev.display);
      if (value !== 0) {
        return {
          ...prev,
          display: formatNumber(1 / value),
          newNumber: true,
        };
      }
      return prev;
    });
  };

  const handleMemoryAdd = () => {
    setState(prev => ({
      ...prev,
      memory: prev.memory + parseFloat(prev.display),
      newNumber: true,
    }));
  };

  const handleMemorySubtract = () => {
    setState(prev => ({
      ...prev,
      memory: prev.memory - parseFloat(prev.display),
      newNumber: true,
    }));
  };

  const handleMemoryRecall = () => {
    updateDisplay(formatNumber(state.memory));
    setState(prev => ({
      ...prev,
      newNumber: true,
    }));
  };

  const handleMemoryClear = () => {
    setState(prev => ({
      ...prev,
      memory: 0,
    }));
  };

  const handleMemoryStore = () => {
    setState(prev => ({
      ...prev,
      memory: parseFloat(prev.display),
      newNumber: true,
    }));
  };

  const formatNumber = (num: number): string => {
    if (Number.isInteger(num)) {
      return num.toString();
    }
    // Limit decimal places to 10
    return parseFloat(num.toFixed(10)).toString();
  };

  return (
    <Card className="mt-4 bg-white dark:bg-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Calculator</span>
          <span className="text-xs text-muted-foreground">
            {state.memory !== 0 && `M: ${formatNumber(state.memory)}`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Display */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-3 text-right">
          <div className="text-sm text-muted-foreground min-h-5">
            {state.operation && state.previousValue !== null ? `${state.previousValue} ${state.operation}` : ''}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white break-words">
            {state.display}
          </div>
        </div>

        {/* Memory Buttons */}
        <div className="grid grid-cols-5 gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={handleMemoryClear}
            className="text-xs h-8"
            title="Memory Clear"
          >
            MC
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMemoryRecall}
            className="text-xs h-8"
            title="Memory Recall"
          >
            MR
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMemoryStore}
            className="text-xs h-8"
            title="Memory Store"
          >
            MS
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMemoryAdd}
            className="text-xs h-8"
            title="Memory Add"
          >
            M+
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMemorySubtract}
            className="text-xs h-8"
            title="Memory Subtract"
          >
            M-
          </Button>
        </div>

        {/* Backspace, Clear, +/-, √ */}
        <div className="grid grid-cols-4 gap-1">
          <Button
            size="sm"
            onClick={handleBackspace}
            className="col-span-2 bg-red-500 hover:bg-red-600 text-white h-8 text-xs"
            title="Delete"
          >
            <Delete className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button
            size="sm"
            onClick={handleClear}
            className="bg-red-500 hover:bg-red-600 text-white h-8 text-xs"
            title="Clear"
          >
            C
          </Button>
          <Button
            size="sm"
            onClick={handleToggleSign}
            className="bg-red-500 hover:bg-red-600 text-white h-8 text-xs"
            title="Toggle Sign"
          >
            +/-
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSquareRoot}
            className="text-xs h-8"
            title="Square Root"
          >
            √
          </Button>
        </div>

        {/* Numbers 7-9, /, % */}
        <div className="grid grid-cols-5 gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNumber('7')}
            className="h-8 text-sm"
          >
            7
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNumber('8')}
            className="h-8 text-sm"
          >
            8
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNumber('9')}
            className="h-8 text-sm"
          >
            9
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOperation('/')}
            className="h-8 text-sm"
          >
            ÷
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOperation('%')}
            className="h-8 text-sm"
          >
            %
          </Button>
        </div>

        {/* Numbers 4-6, *, 1/x */}
        <div className="grid grid-cols-5 gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNumber('4')}
            className="h-8 text-sm"
          >
            4
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNumber('5')}
            className="h-8 text-sm"
          >
            5
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNumber('6')}
            className="h-8 text-sm"
          >
            6
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOperation('*')}
            className="h-8 text-sm"
          >
            ×
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReciprocal}
            className="h-8 text-sm"
          >
            1/x
          </Button>
        </div>

        {/* Numbers 1-3, -, = */}
        <div className="grid grid-cols-5 gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNumber('1')}
            className="h-8 text-sm"
          >
            1
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNumber('2')}
            className="h-8 text-sm"
          >
            2
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNumber('3')}
            className="h-8 text-sm"
          >
            3
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOperation('-')}
            className="h-8 text-sm"
          >
            −
          </Button>
          <Button
            size="sm"
            onClick={handleEquals}
            className="col-span-1 row-span-2 bg-green-500 hover:bg-green-600 text-white h-8 text-sm font-bold"
          >
            =
          </Button>
        </div>

        {/* Number 0, ., + */}
        <div className="grid grid-cols-5 gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNumber('0')}
            className="col-span-2 h-8 text-sm"
          >
            0
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDecimal}
            className="h-8 text-sm"
          >
            .
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOperation('+')}
            className="col-span-2 h-8 text-sm"
          >
            +
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
