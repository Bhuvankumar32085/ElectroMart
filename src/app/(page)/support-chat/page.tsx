"use client";

import { useEffect, useState,useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IUser } from "@/model/user.model";
import {
  Send,
  Menu,
  Search,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  User,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { socket } from "@/HookHelper";

interface ApiResponse {
  success: boolean;
  resType?: "user" | "vandor" | "admin";
  activeUser?: IUser[];
  activeUser1?: IUser;
  activeUser2?: IUser[];
}

interface IMessage {
  _id: string;
  sender: string;
  text: string;
  createdAt: string;
}

const SupportChat = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Controls sidebar visibility
  const [message, setMessage] = useState("");
  const [messageData, setMessageData] = useState<IMessage[]>([]);
  const { loggedUser } = useAppSelector((state) => state.user);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Ye function view ko neeche scroll karega
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 3. Jab bhi 'messageData' change ho ya 'selectedUser' badle, ye chalega
  useEffect(() => {
    scrollToBottom();
  }, [messageData, selectedUser]);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const res = await axios.get<ApiResponse>("/api/support/active-user");

        if (!res.data) return;

        const { resType } = res.data;
        if (res.data.success) {
          if (resType === "user") {
            setUsers(res.data.activeUser || []);
          }

          if (resType === "vandor") {
            const list: IUser[] = [];
            if (res.data.activeUser1) list.push(res.data.activeUser1);
            if (res.data.activeUser2) list.push(...res.data.activeUser2);
            setUsers(list);
          }

          if (resType === "admin") {
            setUsers(res.data.activeUser || []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchChats = async () => {
      if (!selectedUser) {
        return;
      }
      try {
        const res = await axios.post("/api/support/get-message", {
          withUserId: selectedUser._id,
        });

        if (res.data.success) {
          setMessageData(res.data.chat);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchActiveUsers();
    fetchChats();
  }, [selectedUser]);

  const sendMeaageHandler = async () => {
    if (!message.trim() || !selectedUser) {
      return;
    }
    try {
      const res = await axios.post("/api/support/send-message", {
        receiverId: selectedUser._id,
        text: message,
      });
      if (res.data.success) {
        const newMessage: IMessage = {
          _id: crypto.randomUUID(), // temporary id
          sender: String(loggedUser!._id),
          text: message,
          createdAt: new Date().toISOString(),
        };

        setMessageData((prev) => [...prev, newMessage]);
        setMessage("");
      }
    } catch (err) {
      setMessage("");
      console.error(err);
    }
  };

  useEffect(() => {
    socket.on("update_chat", (data) => {
      const { message } = data;
      if (!message) return;

      const newMessage: IMessage = {
        _id: crypto.randomUUID(),
        sender: message.sender,
        text: message.text,
        createdAt: new Date().toISOString(),
      };

      setMessageData((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("update_chat");
    };
  }, []);

  console.log(messageData);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* ================= SIDEBAR (Responsive) ================= */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
            className={`
              absolute z-50 h-full w-full bg-slate-900 border-r border-slate-800/50 shadow-2xl
              md:relative md:w-80 md:flex md:flex-col md:z-0
            `}
          >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
              <h2 className="text-xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Messages
              </h2>
              {/* Close Sidebar Button (Mobile Only) */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 rounded-full hover:bg-slate-800 transition"
              >
                <ArrowLeft size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Search Bar (Visual Only) */}
            <div className="p-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 custom-scrollbar">
              {loading && (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-500 text-xs">Syncing contacts...</p>
                </div>
              )}

              {!loading && users.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No active users found.
                </div>
              )}

              {users.map((u) => (
                <motion.div
                  key={String(u._id)}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedUser(u);
                    // On mobile, close sidebar after selection to see chat
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`
                    group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent
                    ${
                      selectedUser?._id === u._id
                        ? "bg-cyan-500/10 border-cyan-500/20"
                        : "hover:bg-slate-800/50 hover:border-slate-700/50"
                    }
                  `}
                >
                  <div className="relative">
                    {u.image ? (
                      <Image
                        src={u.image}
                        alt={u.name}
                        width={48}
                        height={48}
                        className="rounded-full w-10 h-10 object-cover ring-2 ring-slate-800 group-hover:ring-slate-700 transition-all"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-slate-700 to-slate-800 flex items-center justify-center ring-2 ring-slate-800 text-slate-300">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p
                        className={`font-semibold text-sm truncate ${selectedUser?._id === u._id ? "text-cyan-400" : "text-slate-200"}`}
                      >
                        {u.name}
                      </p>
                      <span className="text-[10px] text-slate-500">Now</span>
                    </div>
                    <p className="text-xs text-slate-500 capitalize truncate group-hover:text-slate-400 transition-colors">
                      {u.role} Account
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ================= CHAT AREA ================= */}
      <main className="flex-1 flex flex-col relative bg-slate-950/50">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle Button */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <Menu size={20} />
              </button>
            )}

            {selectedUser ? (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="relative">
                  {selectedUser.image ? (
                    <Image
                      src={selectedUser.image}
                      width={40}
                      height={40}
                      alt="user"
                      className="rounded-full w-10 h-10 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-100 leading-tight">
                    {selectedUser.name}
                  </h3>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm font-medium">
                Support Dashboard
              </div>
            )}
          </div>

          {/* Header Actions (Visual Only) */}
          {selectedUser && (
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition">
                <Phone size={18} />
              </button>
              <button className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition">
                <Video size={18} />
              </button>
              <button className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition">
                <MoreVertical size={18} />
              </button>
            </div>
          )}
        </header>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-950 relative scroll-smooth">
          {selectedUser ? (
            <>
              {messageData.map((msg: IMessage) => {
                const isOwn = String(msg.sender) === String(loggedUser?._id);

                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end gap-3 ${
                      isOwn ? "justify-end" : ""
                    }`}
                  >
                    {/* Avatar (only for incoming) */}
                    {!isOwn && (
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">
                        {selectedUser.name.charAt(0)}
                      </div>
                    )}

                    <div
                      className={`flex flex-col gap-1 max-w-[75%] md:max-w-[60%] ${
                        isOwn ? "items-end" : ""
                      }`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${
                    isOwn
                      ? "bg-linear-to-br from-cyan-600 to-blue-600 text-white rounded-br-none"
                      : "bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-bl-none"
                  }
                `}
                      >
                        {msg.text}
                      </div>

                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            <div ref={messagesEndRef} />
            </>
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                <User size={40} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                Select a Conversation
              </h3>
              <p className="text-slate-500 max-w-xs text-sm">
                Choose a user from the sidebar to start chatting or view
                previous history.
              </p>
            </div>
          )}
          
        </div>

        {/* Input Area */}
        {selectedUser && (
          <div className="p-4 bg-slate-900/50 border-t border-slate-800/50 backdrop-blur-md">
            <div className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-500/50 transition-all">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent px-3 py-2.5 min-h-11 max-h-32 outline-none text-sm text-slate-200 placeholder:text-slate-500 resize-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={sendMeaageHandler}
                whileTap={{ scale: 0.95 }}
                className={`
                  p-2.5 rounded-xl flex items-center justify-center transition-all duration-200
                  ${
                    message.trim()
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                      : "bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                  }
                `}
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>
        )}
      </main>
    </div> 
  );
};

export default SupportChat;
