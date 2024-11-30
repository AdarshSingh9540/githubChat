'use client'
import { createContext, SetStateAction, useContext, useState ,Dispatch} from "react";

type AppContextType ={
    repo:any[],
    setRepo:Dispatch<SetStateAction<any[]>>;
    user: any[];  
    setUser: Dispatch<SetStateAction<any[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppWrapper({children}:{
    children:React.ReactNode;
}){
    const [repo,setRepo]= useState<any[]>([]);
    const [user,setUser] = useState<any[]>([]);

    return(
        <AppContext.Provider value={{repo,setRepo,user ,setUser}}>
            {children}
        </AppContext.Provider>
    )
}


export function useAppContext(){
    const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppWrapper");
  }
    return context;
}
