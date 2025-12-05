import React, { useEffect, useRef, useState,useContext } from 'react'
import ImageUploading from 'react-images-uploading';
import { Plus,XIcon,BriefcaseBusiness,Users, Trash2, File, ImageIcon, X, LucideRollerCoaster, RotateCcw, FolderPlusIcon, LayoutGridIcon, FolderCheck, FolderPlus, Check, FolderOpen, Ellipsis, Upload } from 'lucide-react'
import { toast } from 'sonner';

import { uploadImagesToSupabase } from '@/lib/supabaseUpload'
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel,AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,} from "@/components/ui/alert-dialog"
import {Breadcrumb,BreadcrumbEllipsis,BreadcrumbItem,BreadcrumbLink,BreadcrumbList,BreadcrumbPage,BreadcrumbSeparator} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CompanyInfoContext } from '@/app/admin/[u]/company/[companySlug]/layout';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input"
import { supabase } from '../../config/supabaseClient';
import Image from 'next/image';
import Link from "next/link"
import AvatarEditor from "react-avatar-editor";
import { set } from 'date-fns';
import { Spinner } from './ui/spinner';
import EditImage from './edit-image';



const AddImage = () => {
     const [activeTab, setActiveTab] = useState("files");
     const [editState,setEditState] = useState(false)
     const [editInfo,setEditInfo] = useState(null)


     const [customDialog,setCustomDialog] =useState(false)
     const [newFolderState,setNewFolderState] = useState(false)
     const [newFolderValue,setNewFolderValue] = useState('')
     const [displayGrid,setDisplayGrid] = useState(false)
   
     const [isLoading,setIsLoading] = useState(true)
     const [selectedFiles,setSelectedFiles] = useState([])
     const [folder,setFolder] = useState('')
     const [selectedFolders,setSelectedFolders] = useState([])
     const [breadCrumbsList,setBreadCrumbsList] = useState([{id:null,name:'All'}])
     const [currentFolder,setCurrentFolder] = useState([])
     const [selectedItems, setSelectedItems] = useState([]);
     const [clickedFileId, setClickedFileId] = useState(null);

      const { info,setInfo,modules } = useContext(CompanyInfoContext)
     
     const [files, setFiles] = useState([
        
     ]);
     
     const [folders, setFolders] = useState([
          { id: "folder1", name: "Folder 1",folderId:null,selected:false},
          { id: "folder2", name: "Folder 2",folderId:null,selected:false},
     ]);
     
     const moveFile = (fileId, folderId) => {
          console.log(`Moving file ${fileId} to folder ${folderId}`);
          setFiles((prevFiles) =>
               prevFiles.map((file) =>
               file.id === fileId ? (console.log(true),{ ...file, folderId:folderId}) : file
               )
          );
     };

     const moveFolder = (folderId ,parentId) => {
          console.log(`Moving file ${folderId} to folder ${parentId}`);
          setFolders((prev) =>
               prev.map((folder) =>
               folder.id === folderId ? (console.log(true),{ ...folder, folderId:parentId}) : folder
               )
          );
     };

     const addFolder = () => {
          setFolders(prev=>[...prev,{id:Date.now(),name:newFolderValue,folderId:breadCrumbsList[breadCrumbsList.length-1].id}])
          setNewFolderValue('')
          setNewFolderState(false)
     }

     const openFolder =(folder)=> {
          setBreadCrumbsList(prev=>[...prev,{id:folder.id,name:folder.name}])
     }

     function navigateBreadcrumbs(item,index) {
          setBreadCrumbsList(prev=>prev.slice(0,index+1))
     }

     const handleToggle = (id) => {
          selectedItems.includes(id)?
          setSelectedItems(prev=>prev.filter(item=>item!==id)):
          setSelectedItems((prev) => [...prev, id]);
     };

     async function fetchCompanyImages(companyName) {
        const { data, error } = await supabase
          .from("images")
          .select("*")
          .ilike("path", `${companyName}/%`);  // all images under company folder

        if (error) {
          console.error("Fetch images error:", error);
          return [];
        }

        // Convert DB rows to your UI format
        return data.map(row => ({
          id: row.id,
          name: row.name,
          url: row.url,
          folderId: row.folder || null
        }));
      }


// const files = await listDeep(companyName);
             
     

     useEffect(()=>{
          const newfolder =  document.getElementById('newfolder')
          newFolderState?newfolder.focus():""
          setSelectedFiles(files.filter((item,index)=>item.selected))
          setSelectedFolders(folders.filter((item,index)=>item.selected))
          console.log(selectedFiles,selectedFolders)
     },[files,folders,newFolderState])   

     useEffect(()=>{  
          fetchCompanyImages(info.name).then(imageList=>{
               setFiles(imageList)
               setIsLoading(false)
          }).catch(err=>{
               toast("Error fetching images:", err)
               setIsLoading(false)
               setFiles([])
          })
         setCurrentFolder(breadCrumbsList[breadCrumbsList.length-1])
     },[breadCrumbsList])

  return (
     <DndProvider backend={HTML5Backend}>

          <>
                  {editState&&editInfo?
                    (
                      <EditImage 
                        editInfo={editInfo} 
                        setEditState={setEditState} 
                        setEditInfo={setEditInfo}
                        onSave={(blob, filename) => {
                          console.log('Image saved:', filename)
                          toast('Image edited successfully')
                        }}
                      />
                    )
                      :
                    (<>
                    
                    <div  defaultValue='files' className="flex md:flex-row flex-col w-full overflow-hidden grow p-1px my-1 items-start gap-0">
                         <div className="flex md:flex-col md:items-center items-start justify-start w-fit md:w-44 bg-white h-fit md:h-full">
                              <div className={`inline-flex  md:flex md:h-full p-3px md:min-w-max md:flex-col w-full justify-start min-w-max bg-white md:items-center mb-2 gap-2 rounded-[3px] md:pb-2 `}>
                                   <Separator className='hidden md:block mb-data-[state=active]:shadow-none1'/>
                                   <Button onClick={()=>{setCustomDialog(true)}} className={'bg-core mx-2.5 h-7 text-xs md:mt-2 hover:bg-core/85'}>Upload Image</Button>
                                   <Button onClick={()=>{setActiveTab('files')}} variant={'ghost'} className={`py-1 text-xs md:w-full inline-flex gap-1 items-center px-4 text-black md:px-3 relative h-11 border-b-4 md:border-r-4 border-transparent rounded-none md:border-b-0 md:mt-2 ${activeTab === 'files' ? 'border-b-army md:border-r-army bg-core_grey2' : 'border-b-transparent md:border-r-transparent bg-transparent'}`}><File className="p-5px"/><span className='text-10px'>Files</span></Button>
                                   <Button onClick={()=>{setActiveTab('trash')}} variant={'ghost'} className={`py-1 text-xs md:w-full inline-flex gap-1 items-center text-black px-4 relative h-11 border-b-4 md:border-r-4 border-transparent rounded-none md:border-b-0 md:mt-2 ${activeTab === 'trash' ? 'border-b-army md:border-r-army bg-core_grey2' : 'border-b-transparent md:border-r-transparent bg-transparent'}`}><Trash2 className="p-5px"/><span className='text-10px'>Trash</span></Button>
                              </div>
                         </div>   
                         <div className="flex flex-col md:border-l  border-t md:border-t-0 w-full relative overflow-hidden md:h-full h-full md:px-2">
                              {activeTab === "files"? (
                              <div className='mt-0 h-full overflow-hidden w-full md:px-1 py-1'>
                                        <div className='w-full h-full  md:gap-2 md:justify-end overflow-hidden justify-start flex md:flex-row flex-col'>
                                             <div className={`md:h-full w-full md:overflow-hidden overflow-scroll  rounded-lg px-1 flex flex-col justify-start`}>
                                                  <Input placeholder="Search product..." className="w-full rounded-lg mb-1 h-8"/>
                                                  <div className='md:grow h-full flex md:overflow-hidden flex-col'>
                                                       <div className="flex items-center px-2 mt-[3px] justify-between">
                                                            <Breadcrumb>
                                                                 <BreadcrumbList className='flex gap-0 sm:gap-0 md:gap-0'>
                                                                      {breadCrumbsList.map((item,index)=>(
                                                                           <div key={index} onClick={()=>{navigateBreadcrumbs(item,index)}} className="inline-flex gap-[3px]">
                                                                                <BreadcrumbItem>
                                                                                     <Button variant='ghost' className='h-0 px-1'>{item.name}</Button>
                                  
                                                                                </BreadcrumbItem>
                                                                           {index!=breadCrumbsList.length-1? <BreadcrumbSeparator  />:""}
                                                                           </div>
                                                                      ))}
                                                                 </BreadcrumbList>
                                                            </Breadcrumb>
                                                       </div>
                                                       <div className="w-full justify-end inline-flex gap-3">
                                                            <div className="inline-flex gap-0 overflow-x-clip "><p data-open={newFolderState} className="inline-flex items-center transition-all -z-10 opacity-0 data-[open=true]:opacity-100 data-[open=true]:right-0 data-[open=true]:z-0 relative -right-3"><Input id='newfolder' onBlur={()=>{!newFolderValue?setNewFolderState(false):""}} className='h-5 rounded-e-none outline-transparent  ml-1 w-24 rounded-s-md' value={newFolderValue} onChange={({target})=>{setNewFolderValue(target.value)}}/><Button onClick={()=>{addFolder()}} size='icon' disabled={!newFolderValue} className='px-1 rounded-e-md rounded-s-none w-fit h-5'><Check className=''/></Button></p><Button onClick={()=>{setNewFolderState(!newFolderState)}} variant='icon' className='p-1 relative min-w-max'><FolderPlus data-open={newFolderState} className='relative transition-all scale-125 data-[open=true]:-z-10 data-[open=true]:opacity-0 opacity-100 z-0'/><FolderCheck data-open={newFolderState} className='absolute transition-all scale-125 data-[open=true]:z-0 -z-10 data-[open=true]:opacity-100 opacity-0'/></Button></div>
                                                            <Button onClick={()=>{setDisplayGrid(!displayGrid)}} variant='ghost'><LayoutGridIcon/></Button>
                                                       </div>
                                                       <p>Selected Items: {selectedItems&&selectedItems.length > 0 ? selectedItems.join(", ") : "None"}</p>

                                                       <div className="h-full overflow-y-scroll">
                                                            <div data-grid={displayGrid} className="grid data-[grid=true]:justify-items-start h-fit data-[grid=true]:gap-3  grid-cols-1 data-[grid=true]:lg:grid-cols-4 data-[grid=true]:md:grid-cols-3 data-[grid=true]:sm:grid-cols-2">

                                                                 {folders.filter(folder => folder.folderId === currentFolder.id).map(folder => (
                                                                      <Folder key={folder.id} folder={folder} children={{folders:folders.filter(item=>item.folderId==folder.id).length, files:files.filter(item=>item.folderId==folder.id).length}} click={()=>{openFolder(folder),console.log(folder.id)}} moveFile={moveFile} moveFolder={moveFolder} grid={displayGrid}/>
                                                                 ))}
                                                                 {isLoading ? (
                                                                          <Spinner className='size-4 ml-2 text-core' spinning={isLoading} />
                                                                    )
                                                                      :
                                                                    (
                                                                      files.filter(file => file.folderId === currentFolder.id).map(file => (
                                                                          <Files key={file.id} file={file} moveFile={moveFile} checked={selectedItems&&selectedItems.some(item=>item===file.id)} onCheck={(status)=>{handleToggle(file.id)}} onFileClick={()=>{setClickedFileId(file.id)}} onCtrlClick={()=>{handleToggle(file.id)}} grid={displayGrid}/>
                                                                      ))
                                                                    )
                                                                 }
                                
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                            <div className="w-full md:w-[40%] md:overflow-y-scroll no_scroll md:border-l px-2 border-t md:border-t-0 md:h-full">
                                              <FileDetailsPanel selectedFile={clickedFileId ? files.find(f => f.id === clickedFileId) : null} setEditState={setEditState} setEditInfo={setEditInfo} />
                                            </div>
                                        </div>
                                      </div>
                                    ) : activeTab === "trash" ? (
                                   <div className="h-full w-full p-2">
                                   <TrashBox />
                                   </div>
                              ) : ''}
                              
                         </div>
                    </div>
                     <AlertDialogFooter className={'p-3'}>
                                <AlertDialogCancel className={'h-7 text-xs '} >Cancel</AlertDialogCancel>
                                <AlertDialogAction className={'h-7 text-xs bg-core hover:bg-core/85'} >Continue</AlertDialogAction>
                              </AlertDialogFooter>
                    </>) 
                  }
              
                                    
          </>

          {/* Modal for upload - appears when `customDialog` is true */}
          {customDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
              <div className="bg-white dark:bg-neutral-900 flex-col flex rounded-lg w-[95%] max-w-4xl h-[60%] overflow-hidden p-2">
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => setCustomDialog(false)}>
                    <X />
                  </Button>
                </div>
                <div className=" rounded-md grow">
                  <UploadModalContent
                    onStartUpload={async (list) => {
                      console.log("Starting upload for:", list);
                     toast(`Uploading ${list.length} image(s)...`)
                     try {
                          const results = await uploadImagesToSupabase(
                            list,
                            {
                              bucket: "products",
                              companyName: info.name,
                              folder: folder || "",
                              owner: info.id
                            }
                          );

                          const success = results.filter(r => !r.error);
                          const failed = results.filter(r => r.error);

                          if (success.length) {
                            toast(`Uploaded ${success.length} image(s)`);

                            // 🔥 Fetch from DB and update UI
                            const imageList = await fetchCompanyImages(info.name);
                            setFiles(imageList);
                          }

                          if (failed.length) {
                            toast(`Failed to upload ${failed.length} image(s)`);
                            console.log("Upload errors:", failed);
                          }

                          setCustomDialog(false);
                          return results;

                        } catch (err) {
                          console.error(err);
                          toast.error ? toast.error("Upload failed") : toast("Upload failed");
                        } finally {
                          setCustomDialog(false);
                        }

                    

                    }}
                    autoUploadThreshold={1}
                  />
                </div>
              </div>
            </div>
          )}
         
     </DndProvider>
  )
}

export default AddImage






export const TrashBox = () => {
  return (
    <div className='w-full h-full  gap-2 md:justify-end justify-start flex md:flex-row flex-col'>
          <div className={`md:h-full w-full h-fit rounded-lg px-1 flex flex-col justify-start`}>
               <Input placeholder="Search product..." className="w-full rounded-lg mb-1 h-8"/>
               
          </div>
          <div className="w-full md:w-[40%] md:overflow-y-scroll no_scroll md:border-l px-2 border-t md:border-t-0 md:h-full">

          </div>
    </div>
  )
}







   
     const ItemTypes = {
          DOCUMENT: "file",
          FOLDER: "folder",
     };
   
const Files = ({ file, grid, checked, onCheck, onFileClick, onCtrlClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.DOCUMENT,
    item: { id: file.id, type: ItemTypes.DOCUMENT },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      onCtrlClick();
    } else {
      onFileClick();
    }
  };

  return (
    <div
      ref={drag}
      data-drag={isDragging}
      data-checked={checked}
      data-grid={grid}
      onClick={handleClick}
      className={`
        border-b relative hover:bg-core_grey2/50 p-1 flex justify-between gap-2 items-center
        h-fit cursor-pointer
        data-[drag=true]:border-b-2 data-[drag=true]:border-army data-[drag=true]:opacity-60 
        data-[checked=true]:bg-core_grey2
        data-[grid=true]:inline-flex
        data-[grid=true]:flex-col 
        data-[grid=true]:justify-start 
        data-[grid=true]:items-center
        data-[grid=true]:gap-0 
        data-[grid=true]:border-none 
        data-[grid=true]:w-32 
        data-[grid=true]:h-44    
      `}
    >

      {/* ONLY CHECKBOX */}
      <p
        data-grid={grid}
        className="inline-flex w-fit items-center justify-start 
          data-[grid=true]:justify-between data-[grid=true]:w-full"
      >
        <Checkbox
          data-grid={grid}
          checked={checked}
          onCheckedChange={(status) => onCheck(status)}
          className={`
            text-white fill-white border scale-90
            data-[grid=true]:scale-75
          `}
        />
      </p>

      {/* IMAGE + NAME */}
      <div
        data-grid={grid}
        className={`
          inline-flex gap-2 items-center grow justify-start 
          data-[grid=true]:flex-col data-[grid=true]:gap-1
        `}
      >
        {/* IMAGE WRAPPER — FIXED HEIGHT, NO CLIPPING */}
        <div
          data-grid={grid}
          className={`
            data-[grid=true]:h-28      
            data-[grid=true]:w-full 
            data-[grid=true]:flex 
            data-[grid=true]:items-center 
            data-[grid=true]:justify-center
            overflow-hidden             
          `}
        >
          <Image
            src={file.url}
            alt="file-item"
            height={80}
            width={80}
            data-drag={isDragging}
            data-grid={grid}
            className={`
              data-[drag=true]:border-army

          
              object-contain 
              max-h-full 
              max-w-full

         
              data-[grid=true]:w-20 
              data-[grid=true]:h-auto
            `}
          />
        </div>

        {/* FILE NAME */}
        <p
          data-grid={grid}
          className={`
            flex overflow-hidden whitespace-nowrap text-xs flex-col items-start text-center
            gap-0 
            data-[grid=true]:whitespace-normal
            data-[grid=true]:leading-tight
            data-[grid=true]:text-[10px]
            data-[grid=true]:max-w-24
            data-[grid=true]:line-clamp-2
            data-[grid=true]:overflow-hidden
            data-[grid=true]:text-ellipsis
          `}
        >
          <span>{file.name}</span>
        </p>
      </div>
    </div>
  );
};


const Folder = ({ folder, moveFile, moveFolder, click, grid, checked, onCheck, children }) => {
  const ref = useRef(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.DOCUMENT, ItemTypes.FOLDER],
    drop: (item) => {
      if (item.type === ItemTypes.DOCUMENT) {
        moveFile(item.id, folder.id);
      } else if (item.type === ItemTypes.FOLDER && item.id !== folder.id) {
        moveFolder(item.id, folder.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FOLDER,
    item: { id: folder.id, type: ItemTypes.FOLDER },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  drag(drop(ref));

  return (
    <div
      ref={ref}
      data-drag={isDragging}
      data-grid={grid}
      className={`
        border-b relative hover:bg-core_grey2/50 py-1 px-1 flex justify-between gap-2 items-center
        data-[drag=true]:border-b-2 data-[drag=true]:border-army data-[drag=true]:opacity-60

        /* GRID MODE BOX STYLE (MATCH FILES COMPONENT) */
        data-[grid=true]:inline-flex
        data-[grid=true]:flex-col
        data-[grid=true]:justify-start
        data-[grid=true]:items-center
        data-[grid=true]:gap-0
        data-[grid=true]:border-none
        data-[grid=true]:w-32
        data-[grid=true]:h-44    /* YOUR REQUESTED GRID HEIGHT */
      `}
    >
      {/* CHECKBOX */}
      <p
        data-grid={grid}
        className="inline-flex w-fit items-center justify-start 
          data-[grid=true]:w-full"
      >
        <Checkbox
          data-grid={grid}
          checked={checked}
          onCheckedChange={(status) => onCheck(status)}
          className={`
            fill-white text-white border scale-90
            data-[grid=true]:scale-75
          `}
        />
      </p>

      {/* FOLDER ICON + NAME */}
      <div
        data-grid={grid}
        onClick={() => click()}
        className={`
          inline-flex gap-2 items-center grow justify-start
          data-[grid=true]:gap-1 
          data-[grid=true]:flex-col
        `}
      >
        {/* ICON WRAPPER (same logic as image wrapper) */}
        <div
          data-grid={grid}
          className={`
            data-[grid=true]:h-24
            data-[grid=true]:w-full
            data-[grid=true]:flex
            data-[grid=true]:items-center
            data-[grid=true]:justify-center
            overflow-hidden
          `}
        >
          <FolderOpen
            data-drag={isDragging}
            data-grid={grid}
            className={`
              data-[drag=true]:border-army
              object-contain
              max-h-full max-w-full
              text-army
              data-[grid=true]:w-16
              data-[grid=true]:h-auto
              data-[grid=true]:mt-2 
              data-[grid=true]:mb-2
            `}
          />
        </div>

        {/* FOLDER NAME + META */}
        <p
          data-grid={grid}
          className="flex items-start gap-0 flex-col"
        >
          <span
            data-grid={grid}
            className={`
              overflow-ellipsis
              data-[grid=true]:text-[10px]
              data-[grid=true]:leading-tight
              data-[grid=true]:line-clamp-2
              data-[grid=true]:max-w-24
            `}
          >
            {folder.name}
          </span>

          <span
            data-grid={grid}
            className="text-gray-500 mt-px text-8px data-[grid=true]:hidden"
          >
            {children.files} files | {children.folders} folders
          </span>
        </p>
      </div>

      {/* DELETE BUTTON (hidden in grid) */}
      <p
        data-grid={grid}
        className="inline-flex w-fit items-center justify-end 
        data-[grid=true]:w-full data-[grid=true]:hidden"
      >
        <Button
          data-grid={grid}
          variant="icon"
          className="p-1 relative min-w-max"
        >
          <Trash2 />
        </Button>
      </p>
    </div>
  );
};

  


// Modal-only upload UI: sidebar for sources + large drop area
export const UploadModalContent = ({ onStartUpload, autoUploadThreshold }) => {
  const [localImages, setLocalImages] = useState([])

  const handleChange = (list) => {
    // console.log("Selected images:", list)
    setLocalImages(list)
    if (list.length >= (autoUploadThreshold || 1)) {
      onStartUpload(list)
    }
  }

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden p-2 text-xs">
      {/* Sidebar with external source options */}
      <div className="w-44 rounded-md border-r px-2 py-3 bg-gray-50 dark:bg-neutral-900">
        <p className="text-sm font-semibold mb-2">Import From</p>
        <div className="flex flex-col gap-2">
          <Button variant="ghost" className="justify-start">Dropbox</Button>
          <Button variant="ghost" className="justify-start">Google Drive</Button>
          <Button variant="ghost" className="justify-start">Local Files</Button>
        </div>
      </div>

      {/* Main drop area */}
      <div className="flex-1 flex items-center justify-center p-2">
        <ImageUploading
        multiple
        value={localImages}
        onChange={handleChange}
        maxNumber={10}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          <>
            <div className="hidden md:flex w-full h-full gap-2">
              <div
                className={`w-full h-full rounded-lg flex justify-center items-center border-3 ${
                  isDragging ? "border-army border-dotted" : "border-border"
                }`}
                {...dragProps}
              >
                <div className="flex items-center flex-col gap-3">
                  <Button
                    variant={"icon"}
                    size="xs"
                    className={`px-4 py-1 text-xs border ${
                      isDragging ? "text-gray-200" : "text-army"
                    }`}
                    onClick={onImageUpload}
                  >
                    <Upload />
                    <Image />
                  </Button>

                   <p className="font-semibold text-xs">Drop images here or click to select</p>
                <p className="text-xs text-neutral-500">Supported: JPG, PNG, GIF</p>
                </div>
              </div>
            </div>
          </>
        )}
      </ImageUploading>
      </div>
    </div>
  )
}

// File Details Panel with Actions and Collapsible Sections
const FileDetailsPanel = ({ selectedFile, setEditState, setEditInfo }) => {
  const [tagsOpen, setTagsOpen] = useState(false)
  const [fileInfoOpen, setFileInfoOpen] = useState(false)

  const handleEditImage = () => {
    setEditInfo(selectedFile)
    setEditState(true)
  }

  return (
    <div className="w-full h-full flex flex-col py-2 text-xs">
      {selectedFile ? (
        <>
          {/* FILE PREVIEW */}
          <div className="mb-4 flex justify-center items-center bg-gray-100 rounded-lg p-2 h-40 w-full">
            <Image
              src={selectedFile.url}
              alt={selectedFile.name}
              height={150}
              width={150}
              className="object-contain max-h-full max-w-full"
            />
          </div>

          {/* FILE NAME */}
          <div className="mb-4 px-2">
            <p className="font-semibold text-sm overflow-wrap">{selectedFile.name}</p>
          </div>

          {/* ACTIONS SECTION */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-sm px-2">Actions</h3>
            <div className="flex flex-col gap-2">
              <Button onClick={handleEditImage} variant="ghost" className="justify-start text-xs gap-2 hover:bg-gray-100">
                <Check size={16} />
                <div className="flex flex-col items-start">
                  <span>Edit Image</span>
                  <span className="text-gray-500 text-8px">Crop, remove background, adjust</span>
                </div>
              </Button>
            </div>
          </div>

          {/* TAGS SECTION - Collapsible */}
          <div className="mb-4 border-t pt-2">
            <button
              onClick={() => setTagsOpen(!tagsOpen)}
              className="w-full flex justify-between items-center py-2 hover:bg-gray-100 px-2 rounded"
            >
              <h3 className="font-semibold text-sm">Tags</h3>
              <span>{tagsOpen ? '−' : '+'}</span>
            </button>
            {tagsOpen && (
              <div className="px-2 py-2 text-xs text-neutral-600">
                <p>No tags added</p>
              </div>
            )}
          </div>

          {/* FILE INFO SECTION - Collapsible */}
          <div className="border-t pt-2">
            <button
              onClick={() => setFileInfoOpen(!fileInfoOpen)}
              className="w-full flex justify-between items-center py-2 hover:bg-gray-100 px-2 rounded"
            >
              <h3 className="font-semibold text-sm">File Info</h3>
              <span>{fileInfoOpen ? '−' : '+'}</span>
            </button>
            {fileInfoOpen && (
              <div className="px-2 py-2 text-xs text-neutral-600 space-y-1">
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Type:</strong> Image</p>
                <p><strong>URL:</strong> <span className="truncate block">{selectedFile.url}</span></p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-full text-neutral-500 text-xs">
          Click on a file to view details
        </div>
      )}
    </div>
  )
}