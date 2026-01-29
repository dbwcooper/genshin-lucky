import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { usePools } from '@/features/pools/components/PoolProvider';
import { useHistory } from '@/features/history/components/HistoryProvider';
import type { PrizePoolId } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Monitor, Trash2, Download } from 'lucide-react';
import { ResetConfirmDialog } from '@/components/ResetConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const { pools, participants, loadParticipants } = usePools();
  const { records, loadRecords, clearHistory, exportAllByPool } = useHistory();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadParticipants();
    loadRecords();
  }, []);

  const handleEnterKiosk = (poolId: PrizePoolId) => {
    navigate({ to: '/kiosk', search: { pool: poolId } });
  };

  const handleReset = async () => {
    await clearHistory();
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">年会抽奖系统</h1>
          <p className="text-slate-400">共 {participants.length} 人参与</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {pools.map((pool) => (
            <Card
              key={pool.id}
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              style={{ borderColor: pool.color }}
              onClick={() => handleEnterKiosk(pool.id)}
            >
              <CardHeader>
                <CardTitle className="text-2xl" style={{ color: pool.color }}>
                  {pool.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">每轮最多 {pool.maxWinners} 人</p>
                <Button className="w-full mt-4" style={{ backgroundColor: pool.color }}>
                  <Monitor className="w-4 h-4 mr-2" />
                  进入抽奖
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                <History className="w-4 h-4 mr-2" />
                历史记录
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>抽奖历史</DialogTitle>
              </DialogHeader>
              <div className="max-h-96 overflow-auto">
                {records.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">暂无记录</p>
                ) : (
                  <div className="space-y-4">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 bg-slate-800 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{record.poolName} - 第{record.roundNumber}轮</p>
                          <p className="text-sm text-slate-400">
                            {record.winners.map((w) => w.participant.name).join(', ')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportAllByPool(record.poolId)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="destructive" onClick={() => setShowResetConfirm(true)} className="min-h-[44px]">
            <Trash2 className="w-4 h-4 mr-2" />
            重置历史
          </Button>
          <ResetConfirmDialog
            open={showResetConfirm}
            onOpenChange={setShowResetConfirm}
            onConfirm={handleReset}
          />
        </div>
      </div>
    </div>
  );
}
