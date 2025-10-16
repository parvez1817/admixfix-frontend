import { useState, useEffect } from "react";
import { Search, User, LogOut, Eye, Printer, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface StudentRequest {
  id: string;
  registerNumber: string;
  name: string;
  dob: string;
  department: string;
  year: string;
  section: string;
  libraryCode: string;
  reason: string;
  status: "pending" | "printed";
  submittedDate: string;
  createdAt?: string;
}

const AdminDashboard = () => {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [acceptedCards, setAcceptedCards] = useState<StudentRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "printed">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Fetch both pending and accepted requests from backend
  useEffect(() => {
    // Fetch pending requests
    fetch(`${API_URL}/api/printed`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: any, index: number) => ({
          id: item._id || index.toString(),
          registerNumber: item.registerNumber,
          name: item.name,
          dob: item.dob,
          department: item.department,
          year: item.year,
          section: item.section,
          libraryCode: item.libraryCode,
          reason: item.reason,
          status: "pending",
          submittedDate: item.createdAt?.split("T")[0] || "N/A",
          createdAt: item.createdAt,
        }));
        setRequests(formatted);
      })
      .catch((err) => console.error("Error fetching pending data:", err));

    // Fetch accepted ID cards history
    fetch(`${API_URL}/api/acchistoryids`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: any, index: number) => ({
          id: item._id || index.toString(),
          registerNumber: item.registerNumber,
          name: item.name,
          dob: item.dob,
          department: item.department,
          year: item.year,
          section: item.section,
          libraryCode: item.libraryCode,
          reason: item.reason,
          status: "printed",
          submittedDate: item.createdAt?.split("T")[0] || "N/A",
          createdAt: item.createdAt,
        }));
        setAcceptedCards(formatted);
      })
      .catch((err) => console.error("Error fetching accepted data:", err));
  }, []);

  // Move request to printed when Print is clicked and store in acceptedidcards collection
  const handlePrint = async (requestId: string) => {
    try {
      // Find the request data
      const request = requests.find(req => req.id === requestId);
      if (!request) {
        toast({
          title: "Error",
          description: "Request not found.",
          variant: "destructive",
        });
        return;
      }

      // Send data to backend to store in acceptedidcards collection
      const requestData = {
        registerNumber: request.registerNumber,
        name: request.name,
        dob: request.dob,
        department: request.department,
        year: request.year,
        section: request.section,
        libraryCode: request.libraryCode,
        reason: request.reason,
      };
      
      const response = await fetch(`${API_URL}/api/accept-idcard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to accept ID card request');
      }

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "printed" } : req
        )
      );

      toast({
        title: "Success",
        description: "Student ID request has been accepted and stored in acceptedidcards collection.",
      });
    } catch (error) {
      console.error('Error accepting ID card request:', error);
      toast({
        title: "Error",
        description: "Failed to accept ID card request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredRequests = (activeTab === "pending" ? requests : acceptedCards).filter((request) => {
    const matchesSearch = request.registerNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "printed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getTabCounts = () => {
    return {
      pending: requests.length,
      printed: acceptedCards.length,
    };
  };

  const tabCounts = getTabCounts();

  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Helper to format ISO date to YYYY-MM-DD HH:mm
  const formatDateTime = (iso?: string): string => {
    if (!iso) return "N/A";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "N/A";
    const pad = (n: number) => String(n).padStart(2, "0");
    const hours24 = d.getHours();
    const ampm = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} | ${pad(hours12)}:${pad(d.getMinutes())} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="relative mb-6 sm:mb-8">
          {/* Main Header Content */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center text-lg sm:text-xl lg:text-2xl font-bold shadow-md border-2 sm:border-4 border-white select-none">
                ID
              </div>
              <div className="text-center lg:text-left">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-blue-900 leading-tight">Sona College of Technology</div>
                <div className="text-blue-600 font-medium text-sm sm:text-base leading-tight">RelDentity Admin Dashboard</div>
              </div>
            </div>
          </div>
          
          {/* Desktop Menu - Top Right */}
          <div className="hidden lg:flex items-center gap-4 absolute top-0 right-0">
            <User className="text-blue-600" size={18} />
            <span className="font-medium text-gray-700 text-sm sm:text-base">Admin User</span>
            <span className="w-px h-6 bg-gray-300 mx-2" />
            <button 
              className="flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95" 
              onClick={handleLogout}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>

          {/* Mobile Menu Button - Top Right */}
          <button 
            className="lg:hidden absolute top-0 right-0 flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 border border-gray-200"
            onClick={() => setShowMobileMenu(true)}
          >
            <Menu size={20} className="text-blue-600 transition-transform duration-200 hover:rotate-90" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-xl">
            <Input
              placeholder="Search by Register Number"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow focus:ring-2 focus:ring-blue-200 text-sm sm:text-base bg-white border border-gray-200"
            />
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>



        {/* Tabs */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "pending" | "printed")}>
            <TabsList className="flex bg-transparent border-none shadow-none p-0 items-center gap-x-2 sm:gap-x-3">
              <TabsTrigger
                value="pending"
                className="relative px-4 sm:px-6 lg:px-8 py-2 text-sm sm:text-base font-semibold rounded-lg focus:outline-none transition-all duration-200
                  data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-blue-600"
              >
                <span className="hidden xs:inline">Pending Requests</span>
                <span className="xs:hidden">Pending</span>
                <span className="ml-1 sm:ml-2 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold">
                  {tabCounts.pending}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="printed"
                className="relative px-4 sm:px-6 lg:px-8 py-2 text-sm sm:text-base font-semibold rounded-lg focus:outline-none transition-all duration-200
                  data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-blue-600"
              >
                Printed
                <span className="ml-1 sm:ml-2 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold">
                  {tabCounts.printed}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>



        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {filteredRequests.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12 sm:py-16 text-base sm:text-lg font-medium">
              No {activeTab} requests found.
            </div>
          ) : (
            filteredRequests.map(request => (
              <Card key={request.id} className="shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-4 sm:p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base sm:text-lg text-gray-900 truncate">{request.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate">{request.department}</div>
                      </div>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:gap-x-4 gap-y-1">
                      <div className="flex-1"><span className="font-medium text-gray-700">D.O.B:</span> {request.dob}</div>
                      <div className="flex-1"><span className="font-medium text-gray-700">Year & Section:</span> {request.year} Year - {request.section}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4 gap-y-1">
                      {/* Left: Library Code */}
                      <div className="flex items-baseline gap-1">
                        <span className="font-medium text-gray-700">Library Code:</span>
                        <span className="text-gray-900">{request.libraryCode}</span>
                      </div>

                      {/* Right: Register Number (left-aligned to match Year & Section) */}
                      <div className="flex flex-col items-start leading-tight">
                        <div className="flex items-baseline gap-1">
                          <span className="font-medium text-gray-700">Register Number:</span>
                          <span className="text-gray-900">{request.registerNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700"><span className="font-medium">Reason:</span> {request.reason}</div>
                    <div className="text-xs sm:text-sm text-gray-700 mt-1">
                      <span className="font-medium">Date & Time:</span> {request.createdAt ? formatDateTime(request.createdAt) : request.submittedDate}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center gap-2 justify-center border-gray-300 hover:bg-gray-100 text-xs sm:text-sm py-2"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowPreviewModal(true);
                      }}
                    >
                      <Eye size={16} /> <span className="hidden xs:inline">Preview</span>
                    </Button>
                    {request.status === "pending" && (
                                           <Button
                      onClick={async () => {
                        try {
                          // Send the complete request data to the backend
                          const res = await fetch(`${API_URL}/api/accept-idcard`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              registerNumber: request.registerNumber,
                              name: request.name,
                              dob: request.dob,
                              department: request.department,
                              year: request.year,
                              section: request.section,
                              libraryCode: request.libraryCode,
                              reason: request.reason
                            }),
                          });
                    
                          if (res.ok) {
                            const data = await res.json();
                            
                            // Show success popup
                            setShowSuccessPopup(true);
                            
                            // Refresh both pending and accepted data
                            try {
                              // Refresh pending requests
                              const pendingResponse = await fetch(`${API_URL}/api/printed`);
                              if (pendingResponse.ok) {
                                const pendingData = await pendingResponse.json();
                                const formattedPending = pendingData.map((item: any, index: number) => ({
                                  id: item._id || index.toString(),
                                  registerNumber: item.registerNumber,
                                  name: item.name,
                                  dob: item.dob,
                                  department: item.department,
                                  year: item.year,
                                  section: item.section,
                                  libraryCode: item.libraryCode,
                                  reason: item.reason,
                                  status: "pending",
                                  submittedDate: item.createdAt?.split("T")[0] || "N/A",
                                  createdAt: item.createdAt,
                                }));
                                setRequests(formattedPending);
                              }

                              // Refresh accepted cards
                              const acceptedResponse = await fetch(`${API_URL}/api/acchistoryids`);
                              if (acceptedResponse.ok) {
                                const acceptedData = await acceptedResponse.json();
                                const formattedAccepted = acceptedData.map((item: any, index: number) => ({
                                  id: item._id || index.toString(),
                                  registerNumber: item.registerNumber,
                                  name: item.name,
                                  dob: item.dob,
                                  department: item.department,
                                  year: item.year,
                                  section: item.section,
                                  libraryCode: item.libraryCode,
                                  reason: item.reason,
                                  status: "printed",
                                  submittedDate: item.createdAt?.split("T")[0] || "N/A",
                                  createdAt: item.createdAt,
                                }));
                                setAcceptedCards(formattedAccepted);
                              }
                            } catch (refreshError) {
                              // Fallback: remove from local state
                              setRequests(prev => 
                                prev.filter(r => r.id !== request.id)
                              );
                            }
                          } else {
                            const errorData = await res.json();
                            alert(errorData.error || "Error while moving request.");
                          }
                        } catch (err) {
                          console.error(err);
                          alert("Error while moving request.");
                        }
                      }}
                      className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow hover:bg-green-600 transition text-xs sm:text-sm"
                    >
                      <span className="hidden xs:inline">Tap to Inform</span>
                      <span className="xs:hidden">Inform</span>
                    </Button>
                   
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      {/* ID Card Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full rounded-xl p-0 bg-white shadow-2xl border-0 mx-2 sm:mx-4">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-full flex items-center px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 lg:pt-8 pb-2">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-blue-800">ID Card Preview</div>
            </div>
            <div className="flex flex-col items-center w-full px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6 lg:pb-8">
              {/* The ID Card */}
              {selectedRequest && (
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md p-2 sm:p-3 md:p-4 lg:p-6 mt-2 mb-4 sm:mb-6 flex flex-col min-w-0 transform scale-90 sm:scale-95 md:scale-100">
                  <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-4 lg:mb-6 flex-wrap gap-1 sm:gap-2">
                    {/* Left: ID Circle */}
                    <div className="flex items-center">
                      <div className="bg-white text-blue-700 rounded-full w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex items-center justify-center text-xs sm:text-sm md:text-lg lg:text-xl font-bold border-2 sm:border-3 md:border-4 border-blue-200 select-none">
                        ID
                      </div>
                    </div>
                    {/* Right: College Name */}
                    <div className="text-right flex-1 min-w-0">
                      <div className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg leading-tight">SONA COLLEGE</div>
                      <div className="text-white text-xs tracking-wide font-medium opacity-80 -mt-0.5 sm:-mt-1">OF TECHNOLOGY</div>
                    </div>
                  </div>
                  {/* Main Info */}
                  <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                    <div className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl leading-tight mb-1 break-words">{selectedRequest.name}</div>
                    <div className="text-white text-xs sm:text-sm md:text-base font-medium mb-1 break-words">{selectedRequest.department}</div>
                    <div className="text-white text-xs sm:text-sm md:text-base font-medium mb-1 break-words">{selectedRequest.registerNumber}</div>
                    <div className="text-white text-xs sm:text-sm md:text-base break-words">{selectedRequest.year} Year - Section {selectedRequest.section}</div>
                  </div>
                  {/* Divider */}
                  <div className="border-t border-blue-200 opacity-60 my-1.5 sm:my-2 md:my-3 lg:my-4" />
                  {/* Bottom Row */}
                  <div className="flex flex-col sm:flex-row justify-between text-white text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 gap-0.5 sm:gap-0">
                    <div className="truncate">DOB: {selectedRequest.dob}</div>
                    <div className="text-right truncate">LIB: {selectedRequest.libraryCode}</div>
                    
                    
                  </div>
                  <div className="text-center text-white text-xs opacity-80 mt-1.5 sm:mt-2">RelDentity Digital ID System</div>
                </div>
              )}
              <Button
                variant="outline"
                className="mt-3 sm:mt-4 px-3 sm:px-4 md:px-6 py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold bg-white hover:bg-gray-100 w-full sm:w-auto"
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm sm:max-w-md w-full relative">
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="text-green-600 text-4xl sm:text-6xl mb-3 sm:mb-4">✓</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Informed student for collection
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                The student has been notified and the request has been moved to the accepted collection.
              </p>
              <Button
                onClick={() => setShowSuccessPopup(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sliding Menu */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-in fade-in duration-300"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Sliding Menu */}
          <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out lg:hidden ${
            showMobileMenu ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
                    ID
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Admin Panel</div>
                    <div className="text-xs text-gray-500">Mobile Menu</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} className="transition-transform duration-200 hover:rotate-90" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 p-4 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <User className="text-blue-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Admin User</div>
                    <div className="text-sm text-gray-500">Administrator</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                    Quick Actions
                  </div>
                  
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left group">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-blue-200 group-hover:scale-110">
                      <Search className="text-blue-600 transition-transform duration-200 group-hover:rotate-12" size={16} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 transition-colors duration-200 group-hover:text-blue-600">Search Requests</div>
                      <div className="text-sm text-gray-500">Find specific requests</div>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left group">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-green-200 group-hover:scale-110">
                      <Printer className="text-green-600 transition-transform duration-200 group-hover:rotate-12" size={16} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 transition-colors duration-200 group-hover:text-green-600">Process Requests</div>
                      <div className="text-sm text-gray-500">Handle pending requests</div>
                    </div>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                    Statistics
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
                      <div className="text-xs text-blue-600 font-medium">Pending</div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-600">{acceptedCards.length}</div>
                      <div className="text-xs text-green-600 font-medium">Accepted</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <LogOut size={18} className="transition-transform duration-200 group-hover:rotate-12" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
