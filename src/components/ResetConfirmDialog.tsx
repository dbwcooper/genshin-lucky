import { useState, useRef, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ResetConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

type Step = 'initial' | 'confirm';

export function ResetConfirmDialog({ open, onOpenChange, onConfirm }: ResetConfirmDialogProps) {
  const [step, setStep] = useState<Step>('initial');
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // 记录触发元素
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      setStep('initial');
      setInputValue('');
    }
  }, [open]);

  // 第二步时 focus 输入框
  useEffect(() => {
    if (step === 'confirm' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const handleClose = () => {
    onOpenChange(false);
    setStep('initial');
    setInputValue('');
    // 返回焦点到触发按钮
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleFirstConfirm = () => {
    setStep('confirm');
  };

  const handleFinalConfirm = () => {
    if (inputValue.toUpperCase() === 'RESET') {
      onConfirm();
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.toUpperCase() === 'RESET') {
      handleFinalConfirm();
    }
  };

  const isResetValid = inputValue.toUpperCase() === 'RESET';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="bg-slate-900 border-slate-700 text-white"
        onEscapeKeyDown={handleClose}
      >
        {step === 'initial' ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>确认重置？</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                此操作将清空所有抽奖历史记录，不可恢复。配置将保留。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={handleClose}
                className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700 min-h-[44px]"
              >
                取消
              </AlertDialogCancel>
              <Button
                onClick={handleFirstConfirm}
                className="bg-red-600 hover:bg-red-700 min-h-[44px]"
              >
                继续
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>二次确认</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                请输入 <span className="text-red-400 font-mono font-bold">RESET</span> 以确认删除所有历史记录
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入 RESET"
              className="bg-slate-800 border-slate-600 text-white font-mono min-h-[44px]"
              autoComplete="off"
            />
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={handleClose}
                className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700 min-h-[44px]"
              >
                取消
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFinalConfirm}
                disabled={!isResetValid}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                确认重置
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
