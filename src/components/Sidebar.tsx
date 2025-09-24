import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Sparkles, 
  Package, 
  ArrowRightLeft, 
  TrendingUp, 
  Trophy, 
  User, 
  Users, 
  Settings, 
  BarChart3,
  Menu,
  X,
  Shield,
  Coins,
  MessageCircle,
  MessageSquare,
  Megaphone,
  Wrench,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['chat']);

  const isActive = (path: string) => location.pathname === path;
  
  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const playerMenuItems = [
    { path: '/play', icon: Home, label: 'Home', description: 'Main clicker game' },
    { path: '/gacha', icon: Sparkles, label: 'Gacha', description: 'Pull for items' },
    { path: '/inventory', icon: Package, label: 'Inventory', description: 'Manage items' },
    { path: '/trade', icon: ArrowRightLeft, label: 'Trade', description: 'Trade with players' },
    { path: '/upgrade', icon: TrendingUp, label: 'Upgrade', description: 'Upgrade slots' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard', description: 'Top players' },
    { path: '/profile', icon: User, label: 'Profile', description: 'Your profile' },
    { path: '/announcements', icon: Megaphone, label: 'Announcements', description: 'Game news' },
  ];
  
  const chatMenuItems = [
    { path: '/chat/global', icon: MessageCircle, label: 'Global Chat', description: 'Chat with everyone' },
    { path: '/chat/private', icon: MessageSquare, label: 'Private Chat', description: 'Direct messages' },
  ];

  const adminMenuItems = [
    { path: '/admin/users', icon: Users, label: 'User Management', description: 'Manage users' },
    { path: '/admin/items', icon: Package, label: 'Item Management', description: 'Manage items' },
    { path: '/admin/trades', icon: ArrowRightLeft, label: 'Trade Management', description: 'Monitor trades' },
    { path: '/admin/economy', icon: Settings, label: 'Economy Settings', description: 'Game settings' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Currency Chart', description: 'Economy analytics' },
    { path: '/admin/announcements', icon: Megaphone, label: 'Announcements', description: 'Manage announcements' },
    { path: '/admin/maintenance', icon: Wrench, label: 'Maintenance', description: 'System maintenance' },
  ];

  const allMenuItems = profile?.role === 'admin' 
    ? [...playerMenuItems, ...adminMenuItems] 
    : playerMenuItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">ClickMaster</h1>
              <p className="text-xs text-gray-400">Modern Clicker Game</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {user && !isCollapsed && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.username || 'Player'}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  profile?.role === 'admin' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {profile?.role === 'admin' ? (
                    <><Shield className="w-3 h-3 inline mr-1" />Admin</>
                  ) : (
                    'Player'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Player Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Game
            </h3>
          )}
          {playerMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
              onClick={() => setIsMobileOpen(false)}
            >
              {/* Active indicator */}
              {isActive(item.path) && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                  layoutId="activeIndicator"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              
              <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-75 truncate">{item.description}</div>
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Chat Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <div className="mb-3">
              <button
                onClick={() => toggleMenu('chat')}
                className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
              >
                <span>Chat</span>
                {expandedMenus.includes('chat') ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            </div>
          )}
          
          <AnimatePresence>
            {(isCollapsed || expandedMenus.includes('chat')) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {chatMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {/* Active indicator */}
                    {isActive(item.path) && (
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                        layoutId="activeIndicatorChat"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                    
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs opacity-75 truncate">{item.description}</div>
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Admin Section */}
        {profile?.role === 'admin' && (
          <div>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
                Admin Panel
              </h3>
            )}
            {adminMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                {/* Active indicator */}
                {isActive(item.path) && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                    layoutId="activeIndicatorAdmin"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                
                <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75 truncate">{item.description}</div>
                  </div>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
        >
          <Menu className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
          {!isCollapsed && <span className="ml-2 text-sm">Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col bg-gray-900 border-r border-gray-700 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-80'
      }`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-gray-900 z-50 flex flex-col"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}