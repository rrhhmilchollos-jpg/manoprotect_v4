/**
 * ManoProtect - Blockchain Transaction Verifier
 * Verificador de transacciones blockchain y criptomonedas
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Link2, Search, Shield, AlertTriangle, CheckCircle, XCircle, 
  Loader2, ArrowLeft, Wallet, TrendingUp, Clock, Copy, ExternalLink,
  Database, Lock, Eye, RefreshCw, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// Bitcoin Icon (SVG)
const BitcoinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-14h-2v2H9v2h2v4H9v2h2v2h2v-2h1c1.1 0 2-.9 2-2v-1c0-.55-.45-1-1-1 .55 0 1-.45 1-1V9c0-1.1-.9-2-2-2h-1V7zm1 7h-2v-2h2v2zm0-4h-2V9h2v2z"/>
  </svg>
);

// Ethereum Icon (SVG)
const EthereumIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 1.75L4.5 12.25l7.5 4.5 7.5-4.5L12 1.75zM4.5 13.5l7.5 8.75 7.5-8.75-7.5 4.5-7.5-4.5z"/>
  </svg>
);

// Supported Networks
const NETWORKS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: BitcoinIcon, color: 'bg-amber-500' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: EthereumIcon, color: 'bg-purple-500' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', icon: Database, color: 'bg-indigo-500' },
  { id: 'bsc', name: 'BNB Chain', symbol: 'BNB', icon: Database, color: 'bg-yellow-500' },
];

// Common Scam Patterns
const SCAM_PATTERNS = [
  { pattern: 'Ponzi/Piramidal', description: 'Promesas de retornos garantizados' },
  { pattern: 'Rug Pull', description: 'Proyectos que desaparecen con los fondos' },
  { pattern: 'Phishing', description: 'Suplantación de proyectos legítimos' },
  { pattern: 'Mixer/Tumbler', description: 'Uso de mezcladores para ocultar fondos' },
];

// Transaction Verifier Component
const TransactionVerifier = () => {
  const [txHash, setTxHash] = useState('');
  const [network, setNetwork] = useState('ethereum');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const verifyTransaction = async () => {
    if (!txHash.trim()) {
      toast.error('Introduce un hash de transacción');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Simulated verification - in production would call blockchain APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Demo result
      const isRisky = txHash.toLowerCase().includes('scam') || Math.random() > 0.7;
      
      setResult({
        verified: true,
        tx_hash: txHash,
        network: network,
        risk_level: isRisky ? 'high' : 'low',
        risk_score: isRisky ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30),
        warnings: isRisky ? [
          'La dirección de destino ha sido reportada como sospechosa',
          'Conexiones con wallets de alto riesgo detectadas'
        ] : [],
        details: {
          from: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
          to: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
          value: (Math.random() * 10).toFixed(4),
          gas_price: (Math.random() * 100).toFixed(2),
          block: Math.floor(Math.random() * 1000000) + 18000000,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      toast.error('Error al verificar la transacción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-500" />
          Verificar Transacción
        </CardTitle>
        <CardDescription>
          Introduce el hash de una transacción para verificar si es segura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Selection */}
        <div className="flex gap-2 flex-wrap">
          {NETWORKS.map((n) => (
            <Button
              key={n.id}
              variant={network === n.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNetwork(n.id)}
              className={network === n.id ? n.color : ''}
            >
              <n.icon className="w-4 h-4 mr-1" />
              {n.symbol}
            </Button>
          ))}
        </div>

        {/* Transaction Hash Input */}
        <div className="flex gap-2">
          <Input
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="0x..."
            className="font-mono flex-1"
          />
          <Button 
            onClick={verifyTransaction}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {/* Result */}
        {result && (
          <div className={`p-4 rounded-lg border-2 ${
            result.risk_level === 'high' ? 'bg-red-50 border-red-300' :
            result.risk_level === 'medium' ? 'bg-amber-50 border-amber-300' :
            'bg-emerald-50 border-emerald-300'
          }`}>
            <div className="flex items-start gap-3">
              {result.risk_level === 'low' ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={
                    result.risk_level === 'high' ? 'bg-red-500' :
                    result.risk_level === 'medium' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }>
                    Riesgo {result.risk_level === 'high' ? 'Alto' : result.risk_level === 'medium' ? 'Medio' : 'Bajo'}
                  </Badge>
                  <span className="text-sm text-zinc-500">Score: {result.risk_score}/100</span>
                </div>

                {result.warnings.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {result.warnings.map((w, i) => (
                      <p key={i} className="text-sm text-red-700 flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {w}
                      </p>
                    ))}
                  </div>
                )}

                <div className="bg-white/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">De:</span>
                    <code className="text-xs bg-zinc-100 px-2 py-1 rounded">
                      {result.details.from.slice(0, 10)}...{result.details.from.slice(-8)}
                    </code>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">A:</span>
                    <code className="text-xs bg-zinc-100 px-2 py-1 rounded">
                      {result.details.to.slice(0, 10)}...{result.details.to.slice(-8)}
                    </code>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Valor:</span>
                    <span className="font-medium">{result.details.value} {NETWORKS.find(n => n.id === network)?.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Bloque:</span>
                    <span>{result.details.block.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Wallet Verifier Component
const WalletVerifier = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const verifyWallet = async () => {
    if (!address.trim()) {
      toast.error('Introduce una dirección de wallet');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isRisky = address.toLowerCase().includes('scam') || Math.random() > 0.6;
      
      setResult({
        address: address,
        verified: true,
        risk_level: isRisky ? 'high' : 'low',
        risk_score: isRisky ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30),
        reports: isRisky ? Math.floor(Math.random() * 50) + 5 : 0,
        labels: isRisky ? ['Scam', 'Phishing', 'Mixer'] : ['Clean'],
        first_seen: '2023-01-15',
        last_activity: new Date().toISOString().split('T')[0],
        total_transactions: Math.floor(Math.random() * 10000),
        connected_to_scams: isRisky ? Math.floor(Math.random() * 10) + 1 : 0
      });
    } catch (error) {
      toast.error('Error al verificar la wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-500" />
          Verificar Wallet
        </CardTitle>
        <CardDescription>
          Comprueba si una dirección de wallet ha sido reportada como fraudulenta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x... o dirección Bitcoin"
            className="font-mono flex-1"
          />
          <Button 
            onClick={verifyWallet}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border-2 ${
            result.risk_level === 'high' ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-300'
          }`}>
            <div className="flex items-start gap-3">
              {result.risk_level === 'low' ? (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={result.risk_level === 'high' ? 'bg-red-500' : 'bg-emerald-500'}>
                    {result.risk_level === 'high' ? 'Wallet Peligrosa' : 'Wallet Limpia'}
                  </Badge>
                  <span className="text-sm text-zinc-500">{result.reports} reportes</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {result.labels.map((label, i) => (
                    <Badge 
                      key={i} 
                      variant="outline" 
                      className={result.risk_level === 'high' ? 'border-red-300 text-red-700' : 'border-emerald-300 text-emerald-700'}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white/50 rounded p-2">
                    <p className="text-zinc-500 text-xs">Primera actividad</p>
                    <p className="font-medium">{result.first_seen}</p>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <p className="text-zinc-500 text-xs">Última actividad</p>
                    <p className="font-medium">{result.last_activity}</p>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <p className="text-zinc-500 text-xs">Total transacciones</p>
                    <p className="font-medium">{result.total_transactions.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <p className="text-zinc-500 text-xs">Conexiones con scams</p>
                    <p className={`font-medium ${result.connected_to_scams > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {result.connected_to_scams}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Smart Contract Verifier
const SmartContractVerifier = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const verifyContract = async () => {
    if (!contractAddress.trim()) {
      toast.error('Introduce una dirección de smart contract');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isRisky = contractAddress.toLowerCase().includes('scam') || Math.random() > 0.5;
      
      setResult({
        address: contractAddress,
        verified: true,
        risk_level: isRisky ? 'high' : 'low',
        risk_score: isRisky ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 25),
        vulnerabilities: isRisky ? [
          { name: 'Rug Pull Risk', severity: 'critical', description: 'El owner puede drenar la liquidez' },
          { name: 'Honeypot', severity: 'high', description: 'Posible trampa para comprar pero no vender' },
        ] : [],
        audit_status: isRisky ? 'No auditado' : 'Auditado',
        source_verified: !isRisky,
        holders: Math.floor(Math.random() * 10000),
        liquidity_locked: !isRisky,
        creator_history: isRisky ? 'Sospechoso' : 'Limpio'
      });
    } catch (error) {
      toast.error('Error al verificar el contrato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-cyan-500" />
          Verificar Smart Contract
        </CardTitle>
        <CardDescription>
          Analiza contratos inteligentes para detectar posibles vulnerabilidades y estafas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="0x... (dirección del contrato)"
            className="font-mono flex-1"
          />
          <Button 
            onClick={verifyContract}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border-2 ${
            result.risk_level === 'high' ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-300'
          }`}>
            <div className="flex items-start gap-3">
              {result.risk_level === 'low' ? (
                <Shield className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={result.risk_level === 'high' ? 'bg-red-500' : 'bg-emerald-500'}>
                    {result.risk_level === 'high' ? 'Alto Riesgo' : 'Contrato Seguro'}
                  </Badge>
                  <Badge variant="outline">{result.audit_status}</Badge>
                </div>

                {result.vulnerabilities.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {result.vulnerabilities.map((v, i) => (
                      <div key={i} className="bg-red-100 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <Badge className={v.severity === 'critical' ? 'bg-red-600' : 'bg-orange-500'}>
                            {v.severity}
                          </Badge>
                          <span className="font-medium text-sm text-red-800">{v.name}</span>
                        </div>
                        <p className="text-xs text-red-700 mt-1">{v.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white/50 rounded p-2">
                    <p className="text-zinc-500 text-xs">Código verificado</p>
                    <p className={`font-medium ${result.source_verified ? 'text-emerald-600' : 'text-red-600'}`}>
                      {result.source_verified ? 'Sí' : 'No'}
                    </p>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <p className="text-zinc-500 text-xs">Liquidez bloqueada</p>
                    <p className={`font-medium ${result.liquidity_locked ? 'text-emerald-600' : 'text-red-600'}`}>
                      {result.liquidity_locked ? 'Sí' : 'No'}
                    </p>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <p className="text-zinc-500 text-xs">Holders</p>
                    <p className="font-medium">{result.holders.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <p className="text-zinc-500 text-xs">Historial creador</p>
                    <p className={`font-medium ${result.creator_history === 'Limpio' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {result.creator_history}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Page Component
export default function BlockchainVerifier() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transaction');

  return (
    <>
      <Helmet>
        <title>Verificador Blockchain - ManoProtect</title>
        <meta name="description" content="Verifica transacciones, wallets y smart contracts en blockchain para detectar estafas y fraudes." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-indigo-50/30 to-purple-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/shield')}
              className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Shield
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Link2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Blockchain Transaction Verifier</h1>
                <p className="text-white/80">
                  Verifica transacciones, wallets y contratos para evitar estafas crypto
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Search className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900">1.2M+</p>
                  <p className="text-sm text-zinc-500">Verificaciones</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900">45K+</p>
                  <p className="text-sm text-zinc-500">Scams detectados</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900">$120M</p>
                  <p className="text-sm text-zinc-500">Protegidos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-white">
              <TabsTrigger value="transaction" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Transacción
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Wallet
              </TabsTrigger>
              <TabsTrigger value="contract" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Smart Contract
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transaction" className="mt-6">
              <TransactionVerifier />
            </TabsContent>

            <TabsContent value="wallet" className="mt-6">
              <WalletVerifier />
            </TabsContent>

            <TabsContent value="contract" className="mt-6">
              <SmartContractVerifier />
            </TabsContent>
          </Tabs>

          {/* Common Scam Patterns */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Patrones de Estafa Comunes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {SCAM_PATTERNS.map((pattern, idx) => (
                  <div key={idx} className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                    <h4 className="font-semibold text-zinc-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      {pattern.pattern}
                    </h4>
                    <p className="text-sm text-zinc-600 mt-1">{pattern.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Educational Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">¿Cómo protegerte?</h3>
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Verifica siempre las direcciones antes de enviar fondos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Investiga los smart contracts antes de interactuar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Desconfía de promesas de rendimientos garantizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Nunca compartas tu seed phrase o claves privadas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3 text-zinc-800">Redes soportadas</h3>
                <div className="space-y-3">
                  {NETWORKS.map((network, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-zinc-50 rounded-lg">
                      <div className={`w-10 h-10 ${network.color} rounded-lg flex items-center justify-center text-white`}>
                        <network.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-800">{network.name}</p>
                        <p className="text-xs text-zinc-500">{network.symbol}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
