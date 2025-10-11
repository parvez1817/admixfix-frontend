import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Loader } from "lucide-react";
import { API_URL } from "@/lib/utils";

const Login = () => {
  const [adminId, setAdminId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim()) {
      setError("Admin ID is required");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId }),
      });
      const data = await response.json();
      if (data.success) {
        navigate("/dashboard");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-blue-400">
      <div className="mt-12 mb-8 text-center">
        <div className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Sona College of Technology
        </div>
        <div className="text-lg md:text-xl font-medium text-blue-100 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Teachers don’t just teach , they shape the future.
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-lg flex flex-col gap-6 border border-blue-100"
      >
        <div className="flex flex-col items-center mb-2">
          <span className="flex items-center justify-center mb-1">
            <User className="text-yellow-400 mr-2" size={32} strokeWidth={2.5} />
            <span className="text-2xl md:text-3xl font-extrabold text-black drop-shadow-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Admin Login
            </span>
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="adminId" className="text-lg font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Admin ID
          </label>
          <Input
            id="adminId"
            type="text"
            placeholder="Enter your admin id"
            value={adminId}
            onChange={e => {
              setAdminId(e.target.value);
              setError("");
            }}
            className="py-3 px-4 rounded-md border border-gray-400 focus:ring-2 focus:ring-blue-400 text-base bg-white"
            autoFocus
          />
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black text-lg font-bold shadow-md transition-colors mt-2"
          style={{ fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
        >
          {isLoading && <Loader className="animate-spin" />}
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <div className="mt-10 text-center text-white text-lg font-semibold drop-shadow-md" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Digital ID Card Request Management System
      </div>
    </div>
  );
};

export default Login; 