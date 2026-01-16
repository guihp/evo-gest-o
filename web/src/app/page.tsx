'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { Plus, Wifi, WifiOff, RefreshCw, LogOut, Trash2, Loader2, Link as LinkIcon, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/custom-dialog';
import { ConnectModal } from '@/components/connect-modal';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
    const { data: instances, error, isLoading, mutate } = useSWR('/api/instances', fetcher, { refreshInterval: 5000 });
    const [createOpen, setCreateOpen] = useState(false);
    const [newInstanceName, setNewInstanceName] = useState('');
    const [creating, setCreating] = useState(false);

    const [selectedInstance, setSelectedInstance] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!newInstanceName) return;
        setCreating(true);
        try {
            await fetch('/api/instances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newInstanceName })
            });
            setNewInstanceName('');
            setCreateOpen(false);
            mutate();
        } catch (e) {
            alert('Failed to create');
        } finally {
            setCreating(false);
        }
    };

    const handleAction = async (name: string, action: string) => {
        if (!confirm(`Are you sure you want to ${action} ${name}?`)) return;
        try {
            await fetch(`/api/instance/${name}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            mutate();
        } catch (e) {
            alert('Action failed');
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
            <header className="mb-8 flex justify-between items-center max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Instances</h1>
                    <p className="text-muted-foreground">Manage your Evolution API instances</p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Plus size={20} /> New Instance
                </Button>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading && <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>}

                {instances && Array.isArray(instances) && instances.map((instance: any) => (
                    <Card key={instance.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium truncate">{instance.name}</CardTitle>
                            <Badge variant={instance.connectionStatus === 'open' ? 'success' : instance.connectionStatus === 'connecting' ? 'warning' : 'secondary'}>
                                {instance.connectionStatus}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-4 mb-4">
                                {instance.profilePicUrl ? (
                                    <img src={instance.profilePicUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Wifi size={24} />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{instance.profileName || 'No Profile'}</span>
                                    <span className="text-xs text-muted-foreground">{instance.ownerJid?.split('@')[0] || instance.number || 'No Number'}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-2 border-t pt-4 bg-slate-50/50 dark:bg-slate-900/50">
                            <Button
                                size="sm"
                                variant={instance.connectionStatus === 'open' ? 'secondary' : 'default'}
                                onClick={() => setSelectedInstance(instance.name)}
                                className={instance.connectionStatus === 'open' ? "opacity-50" : ""}
                            >
                                <QrCode size={16} className="mr-2" /> Connect
                            </Button>

                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" title="Restart" onClick={() => handleAction(instance.name, 'restart')}>
                                    <RefreshCw size={16} />
                                </Button>
                                <Button size="icon" variant="ghost" title="Logout" onClick={() => handleAction(instance.name, 'logout')}>
                                    <LogOut size={16} />
                                </Button>
                                <Button size="icon" variant="ghost" title="Delete" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleAction(instance.name, 'delete')}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </main>

            {/* Create Modal */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Instance">
                <div className="flex flex-col gap-4 py-4">
                    <Input
                        placeholder="Instance Name"
                        value={newInstanceName}
                        onChange={e => setNewInstanceName(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating || !newInstanceName}>
                            {creating ? <Loader2 className="animate-spin mr-2" /> : null} Create
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Connect Modal */}
            {selectedInstance && (
                <ConnectModal
                    open={!!selectedInstance}
                    onClose={() => setSelectedInstance(null)}
                    instanceName={selectedInstance}
                />
            )}
        </div>
    );
}
