import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// Define Dashboard layout configuration types
interface LayoutConfig {
  leftPanels: string[];
  rightPanels: string[];
}

// Define Dashboard state
interface DashboardState {
  layoutConfig: {
    standard: LayoutConfig;
    detailed: LayoutConfig;
    custom: LayoutConfig;
  };
  currentView: 'standard' | 'detailed' | 'custom';
  isLayoutEditing: boolean;
  lastViewedStocks: string[];
}

// Define action types
type DashboardAction = 
  | { type: 'SET_VIEW', payload: 'standard' | 'detailed' | 'custom' }
  | { type: 'TOGGLE_LAYOUT_EDITING' }
  | { type: 'UPDATE_LAYOUT', payload: { view: 'standard' | 'detailed' | 'custom', layout: LayoutConfig } }
  | { type: 'RESET_LAYOUT', payload: 'standard' | 'detailed' | 'custom' }
  | { type: 'ADD_VIEWED_STOCK', payload: string }
  | { type: 'REORDER_PANEL', payload: { view: 'standard' | 'detailed' | 'custom', source: { column: 'left' | 'right', index: number }, destination: { column: 'left' | 'right', index: number } } };

const defaultLeftPanels = [
  'market-activity', 
  'stock-details', 
  'forecasting',
  'profit-loss-tracker',
  'market-heatmap'
];

const defaultRightPanels = [
  'global-markets', 
  'watchlist', 
  'news',
  'portfolio',
  'alerts',
  'news-sentiment',
  'earnings-calendar'
];

// Initial state
const initialState: DashboardState = {
  layoutConfig: {
    standard: {
      leftPanels: defaultLeftPanels,
      rightPanels: defaultRightPanels
    },
    detailed: {
      leftPanels: defaultLeftPanels,
      rightPanels: defaultRightPanels
    },
    custom: {
      leftPanels: defaultLeftPanels,
      rightPanels: defaultRightPanels
    }
  },
  currentView: 'standard',
  isLayoutEditing: false,
  lastViewedStocks: []
};

// Create context
const DashboardContext = createContext<{
  state: DashboardState;
  setView: (view: 'standard' | 'detailed' | 'custom') => void;
  toggleLayoutEditing: () => void;
  updateLayout: (view: 'standard' | 'detailed' | 'custom', layout: LayoutConfig) => void;
  resetLayout: (view: 'standard' | 'detailed' | 'custom') => void;
  addViewedStock: (symbol: string) => void;
  reorderPanel: (view: 'standard' | 'detailed' | 'custom', source: { column: 'left' | 'right', index: number }, destination: { column: 'left' | 'right', index: number }) => void;
}>({
  state: initialState,
  setView: () => {},
  toggleLayoutEditing: () => {},
  updateLayout: () => {},
  resetLayout: () => {},
  addViewedStock: () => {},
  reorderPanel: () => {}
});

// Reducer function
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload
      };
    case 'TOGGLE_LAYOUT_EDITING':
      return {
        ...state,
        isLayoutEditing: !state.isLayoutEditing
      };
    case 'UPDATE_LAYOUT':
      return {
        ...state,
        layoutConfig: {
          ...state.layoutConfig,
          [action.payload.view]: action.payload.layout
        }
      };
    case 'RESET_LAYOUT':
      return {
        ...state,
        layoutConfig: {
          ...state.layoutConfig,
          [action.payload]: {
            leftPanels: defaultLeftPanels,
            rightPanels: defaultRightPanels
          }
        }
      };
    case 'ADD_VIEWED_STOCK':
      // Add stock to recently viewed (if not already there) and limit to last 5
      return {
        ...state,
        lastViewedStocks: [
          action.payload,
          ...state.lastViewedStocks.filter(stock => stock !== action.payload)
        ].slice(0, 5)
      };
    case 'REORDER_PANEL':
      const { view, source, destination } = action.payload;
      const currentLayout = {...state.layoutConfig[view]};
      
      // Handle reordering within the same column
      if (source.column === destination.column) {
        const panelList = source.column === 'left' ? [...currentLayout.leftPanels] : [...currentLayout.rightPanels];
        const [movedPanel] = panelList.splice(source.index, 1);
        panelList.splice(destination.index, 0, movedPanel);
        
        if (source.column === 'left') {
          currentLayout.leftPanels = panelList;
        } else {
          currentLayout.rightPanels = panelList;
        }
      } 
      // Handle moving between columns
      else {
        const sourceList = source.column === 'left' ? [...currentLayout.leftPanels] : [...currentLayout.rightPanels];
        const destList = destination.column === 'left' ? [...currentLayout.leftPanels] : [...currentLayout.rightPanels];
        
        const [movedPanel] = sourceList.splice(source.index, 1);
        destList.splice(destination.index, 0, movedPanel);
        
        currentLayout.leftPanels = source.column === 'left' ? sourceList : destList;
        currentLayout.rightPanels = source.column === 'right' ? sourceList : destList;
      }
      
      return {
        ...state,
        layoutConfig: {
          ...state.layoutConfig,
          [view]: currentLayout
        }
      };
    default:
      return state;
  }
}

// Provider component
export const DashboardProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  
  // Memoized actions
  const setView = useCallback((view: 'standard' | 'detailed' | 'custom') => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);
  
  const toggleLayoutEditing = useCallback(() => {
    dispatch({ type: 'TOGGLE_LAYOUT_EDITING' });
  }, []);
  
  const updateLayout = useCallback((view: 'standard' | 'detailed' | 'custom', layout: LayoutConfig) => {
    dispatch({ type: 'UPDATE_LAYOUT', payload: { view, layout } });
  }, []);
  
  const resetLayout = useCallback((view: 'standard' | 'detailed' | 'custom') => {
    dispatch({ type: 'RESET_LAYOUT', payload: view });
  }, []);
  
  const addViewedStock = useCallback((symbol: string) => {
    dispatch({ type: 'ADD_VIEWED_STOCK', payload: symbol });
  }, []);
  
  const reorderPanel = useCallback((
    view: 'standard' | 'detailed' | 'custom', 
    source: { column: 'left' | 'right', index: number }, 
    destination: { column: 'left' | 'right', index: number }
  ) => {
    dispatch({ 
      type: 'REORDER_PANEL', 
      payload: { view, source, destination } 
    });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    setView,
    toggleLayoutEditing,
    updateLayout,
    resetLayout,
    addViewedStock,
    reorderPanel
  }), [state, setView, toggleLayoutEditing, updateLayout, resetLayout, addViewedStock, reorderPanel]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook for using the dashboard context
export const useDashboard = () => useContext(DashboardContext);

export default DashboardContext;
