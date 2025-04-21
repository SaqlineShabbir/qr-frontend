import { useState, useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import toast from "react-hot-toast";

type QRStatus = "active" | "used" | "expired" | "dismissed";

interface QRData {
  url: string;
  token: string;
  status: QRStatus;
  page: string;
  expiresAt: string;
}

interface ActiveQRResponse {
  status: string;
  valid: boolean;
  expiresAt: string;
  visaId: string;
  token: string;
}

interface QrGeneratorProps {
  visaId: any;
  page: string;
}

const QrGenerator: React.FC<QrGeneratorProps> = ({ visaId, page }) => {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [canGenerate, setCanGenerate] = useState<boolean>(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset QR state when page prop changes
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [page]);

  // Check initial status on mount or when page changes
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        // Reset state for new page
        setQrData(null);
        setCanGenerate(true);
        
        // Check if we can generate new QR for this specific page
        const canGenResponse = await axios.get<{ canGenerate: boolean }>(
          `${API_URL}/api/qr/can-generate/${visaId}/${page}`
        );
        
        // Check if there's an active QR for this specific page
        const statusResponse = await axios.get<ActiveQRResponse>(
          `${API_URL}/api/qr/active/${visaId}/${page}`
        );
        
        setCanGenerate(canGenResponse.data.canGenerate);
        
        if (statusResponse.data.valid && statusResponse.data.token) {
          setQrData({
            url: `${window.location.origin}/${page}/${visaId}?token=${statusResponse.data.token}`,
            token: statusResponse.data.token,
            status: 'active',
            page,
            expiresAt: statusResponse.data.expiresAt
          });

          startStatusCheck(statusResponse.data.token);
        }
      } catch (error) {
        console.error('Failed to check initial status', error);
      }
    };
    
    checkInitialStatus();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [visaId, page]);

  const startStatusCheck = (token: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      checkQRStatus(token);
    }, 5000);
  };

  const checkQRStatus = async (token: string): Promise<void> => {
    try {
      const response = await axios.get<{
        status: string;
        valid: boolean;
        expiresAt: string;
      }>(`${API_URL}/api/qr/status/${token}`, {
        params: { page, visaId } // Ensure we're checking status for this specific page
      });

      if (!response.data.valid || response.data.status === 'used') {
        setQrData(prev => {
          if (!prev) return null;
          return { 
            ...prev, 
            status: response.data.status === 'used' ? 'used' : 'expired' 
          };
        });
        
        if (response.data.status === 'used') {
          setCanGenerate(false);
        }

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Failed to check QR status', error);
    }
  };

  // const generateQR = async (): Promise<void> => {
  //   if (!canGenerate) {
  //     toast.error("QR code for this page has already been used");
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const response = await axios.post<{
  //       qrUrl: string;
  //       token: string;
  //       expiresAt: string;
  //       page: string;
  //     }>(`${API_URL}/api/qr/generate`, { visaId, page });

  //     const newQrData = {
  //       url: response.data.qrUrl,
  //       token: response.data.token,
  //       status: "active" as QRStatus,
  //       page: response.data.page,
  //       expiresAt: response.data.expiresAt,
  //     };

  //     setQrData(newQrData);
  //     setCanGenerate(true);
  //     toast.success("QR code generated");

  //     startStatusCheck(newQrData.token);
  //   } catch (error: unknown) {
  //     if (axios.isAxiosError(error)) {
  //       if (error.response?.status === 403) {
  //         setCanGenerate(false);
  //         toast.error("QR code for this page has already been used");
  //       } else {
  //         toast.error(error.response?.data?.error || "Failed to generate QR");
  //       }
  //     } else {
  //       toast.error("An unexpected error occurred");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const getButtonText = (): string => {
  //   if (!canGenerate) return "Already Scanned";
  //   if (isLoading) return "Generating...";
  //   if (!qrData) return "Get QR Code";
  //   if (qrData.status === "active") return "Hide QR Code";
  //   if (qrData.status === "used") return "Already Scanned";
  //   if (qrData.status === "expired") return "QR Expired";
  //   return "QR Closed";
  // };

  // const isButtonDisabled =
  //   !canGenerate ||
  //   isLoading ||
  //   (!!qrData && ["used", "expired", "dismissed"].includes(qrData.status));

  const generateQR = async (): Promise<void> => {
    // If QR is active and button says "Hide QR Code", just hide it without making a request
    if (qrData?.status === "active" && getButtonText() === "Hide QR Code") {
      setQrData(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
  
    if (!canGenerate) {
      toast.error("QR code for this page has already been used");
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await axios.post<{
        qrUrl: string;
        token: string;
        expiresAt: string;
        page: string;
      }>(`${API_URL}/api/qr/generate`, { visaId, page });
  
      const newQrData = {
        url: response.data.qrUrl,
        token: response.data.token,
        status: "active" as QRStatus,
        page: response.data.page,
        expiresAt: response.data.expiresAt,
      };
  
      setQrData(newQrData);
      setCanGenerate(true);
      toast.success("QR code generated");
  
      startStatusCheck(newQrData.token);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setCanGenerate(false);
          toast.error("QR code for this page has already been used");
        } else {
          toast.error(error.response?.data?.error || "Failed to generate QR");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const getButtonText = (): string => {
    if (!canGenerate) return "Already Scanned";
    if (isLoading) return "Generating...";
    if (!qrData) return "Continue On Mobile";
    if (qrData.status === "active") return "Hide QR Code";
    if (qrData.status === "used") return "Already Scanned";
    if (qrData.status === "expired") return "QR Expired";
    return "QR Closed";
  };
  
  const isButtonDisabled =
    (!canGenerate && !qrData) ||
    isLoading ||
    (!!qrData && ["used", "expired", "dismissed"].includes(qrData.status));

  return (
    <div className="relative">
      <button
        onClick={generateQR}
        disabled={isButtonDisabled}
        className={`px-6 py-3 rounded ${
          isButtonDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {getButtonText()}
      </button>

      {qrData?.status === "active" && (
        <div className="absolute top-10 mt-4 p-4 bg-gray-50 rounded-lg text-center z-10">
          <div className="flex justify-center">
            <QRCodeCanvas value={qrData.url} size={160} includeMargin={true} />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Scan this one-time QR code
          </p>
          <p className="text-xs text-gray-500">
            Expires at: {new Date(qrData.expiresAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default QrGenerator;