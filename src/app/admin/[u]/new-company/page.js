'use client'

import { useEffect, useState,useContext } from 'react'
import { supabase } from '../../../../../config/supabaseClient'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, ArrowRight, Bell, TriangleAlert, Check } from 'lucide-react'
import { DataContext } from '../layout'
import { AppSidebar } from '@/components/sidebars/app-sidebar/app-sidebar'
import {SidebarInset,SidebarProvider,SidebarTrigger,} from "@/components/ui/sidebar"
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/headers/dashboard-header'
import { Button } from '@/components/ui/button'
import {Field,FieldDescription,FieldGroup,FieldLabel,FieldSeparator,} from "@/components/ui/field"
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import ComboDropTemplate from '@/components/combo-drop'
import { cn } from '@/lib/utils'
import { Tabs,TabsTrigger,TabsList,TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export default function AdminUserPage() {

        const router = useRouter()
        const params = useParams()
        const {data,setData} = useContext(DataContext)
        const [step, setStep] = useState(1)
        const [isLoading,setIsLoading] = useState(false);
        const [checkingName, setCheckingName] = useState(false);
        const [nameExists, setNameExists] = useState(null);
        const [formData, setFormData] = useState({
            name: "",
            type: "",
            email: "",
            phone: "",
            country: "",
            industry: "",
            currency: "",
            taxId: "",
            branchAddress: "",
            branchCity: "",
        });
          const requiredFields = ["name", "email", "type", "currency","phone"];

          const handleChange = (e) => {
                setFormData({ ...formData, [e.target.name]: e.target.value });
            };

            const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
            const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
            const goToStep = (num) => setStep(num);

            const isFormValid = requiredFields.every((field) => formData[field].trim() !== "") && !nameExists // ✅ also require unique name

          

                        const createHeadOfficeBranch = async (
                            companyId,
                            companyName,
                            companyEmail,
                            companyPhone,
                            companyCountry,
                            companyCurrency,
                            branchAddress,
                            branchCity
                        ) => {
                        try {
                                const { data: branch, error: branchError } = await supabase
                                    .from('branches')
                                    .insert([
                                        {
                                            company: companyId,
                                            name: 'HEAD OFFICE',
                                            address: branchAddress || '',
                                            city: branchCity || '',
                                            country: companyCountry,
                                            phone: companyPhone,
                                            email: companyEmail,
                                            isheadoffice: true,
                                            status: 'active',
                                            currency: companyCurrency,
                                        },
                                    ])
                                    .select()
                                    .single();

                if (branchError) {
                  console.error('Error creating head office branch:', branchError);
                  toast.error('Head office branch creation failed');
                  return false;
                }

                toast.success('✓ Head office branch created!');
                return true;
              } catch (err) {
                console.error('Unexpected error creating branch:', err);
                toast.error('Unexpected error creating branch');
                return false;
              }
            };

            const handleSubmit = async () => {
            if (!isFormValid) {
                toast.error("Please fill in all required fields before submitting.");
                return;
            }

            setIsLoading(true);

            // 1️⃣ Create the company
            const { data: insertedCompany, error: companyError } = await supabase
                .from("companies")
                .insert([
                {
                    name: formData.name,
                    owner: data.profile.id,
                    type: formData.type,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                    industry: formData.industry,
                    currency: formData.currency,
                    taxId: formData.taxId,
                },
                ])
                .select()
                .single();

            if (companyError) {
                toast.error("Failed to create company");
                console.log("Error inserting company:", companyError);
                setIsLoading(false);
                return;
            } else {
                    toast.success("✨ Company created successfully!");
                    console.log(insertedCompany);

                    const companyType = insertedCompany.type;
                    const companyName = insertedCompany.name;
                    const companyId = insertedCompany.id;
                    console.log(companyType,companyId);

                    // 2️⃣ Create head office branch
                                        const branchCreated = await createHeadOfficeBranch(
                                            companyId,
                                            companyName,
                                            formData.email,
                                            formData.phone,
                                            formData.country,
                                            formData.currency,
                                            formData.branchAddress,
                                            formData.branchCity
                                        );

                    if (!branchCreated) {
                      console.warn('Branch creation failed but company exists');
                    }

                    // 3️⃣ Fetch and assign default modules
                    const { data: defaultModules, error: modulesError } = await supabase
                    .from("modules")
                    .select("key, defaulttypes,name")
                    .contains("defaulttypes", [companyType]);

                    if (modulesError) {
                        console.log("Error fetching default modules:", modulesError);
                        toast.error("Failed to assign default modules.");
                    } else {
                        console.log(defaultModules);
                        const moduleRows = defaultModules.map((mod) => ({
                            company: companyId,
                            company_name: companyName,
                            mod_key: mod.key,
                            name: mod.name,
                        }));

                        const { error: addModuleError } = await supabase
                        .from("company_modules")
                        .insert(moduleRows);

                        if (addModuleError) {
                          console.log("Error adding company modules:", addModuleError);
                          toast.error("Failed to add default modules.");
                        }

                    }

                    const { data: companies, error: reloadError } = await supabase
                        .from("companies")
                        .select("id, name, slug")
                        .eq("owner", data.profile.id);

                    if (reloadError) {
                        toast.error("Unable to refresh data");
                    } else {
                        setData((prev) => ({ ...prev, companies }));
                    }
                }

            setIsLoading(false);
            router.push(`/admin/${params.u}`);
            };


            useEffect(() => {
                if (!formData.name.trim()) {
                    setNameExists(null)
                    return
                }

                const timer = setTimeout(async () => {
                    setCheckingName(true)
                    const { data: existingCompany, error } = await supabase
                        .from("companies")
                        .select("id")
                        .ilike("name", formData.name.trim()) // case-insensitive match
                        .maybeSingle()

                    if (error) {
                        console.error("Error checking company name:", error)
                        setNameExists(null)
                    } else {
                        setNameExists(!!existingCompany)
                    }
                    setCheckingName(false)
                }, 800)

                return () => clearTimeout(timer)
            }, [formData.name])




  return (

    <SidebarProvider   className={'relative'}>
      <AppSidebar />
      <SidebarInset className={' overflow-hidden h-svh static'}>

        <div className="flex mb-0.5 h-full overflow-hidden flex-col gap-4">
            <div className='flex-col  border-b-8 overflow-hidden h-full flex'>
                <div className='h-12'>
                    <Header >
                    <div className="flex">
                        <div className='md:flex gap-2 hidden mr-1 items-center '>
                    
                        </div>
                        <Button variant='ghost' size='icon' className='relative ml-3'>
                        <Bell className='h-5 w-5'/>
                        <span className='absolute -top-0.5 -right-0.5 text-[9px] bg-red-600 translate-x-[-48.8%] translate-y-[48.9%] text-white font-semibold flex items-center justify-center size-3.5 rounded-full'>3</span>
                        </Button>
                    </div>
                    </Header>
                </div>
                <div className='md:px-5 flex-col overflow-y-hidden grow p-0.5 flex px-3'>
        
                   
                        <div className="md:w-4/5 mx-auto font-WixMade tracking-tight mt-10 p-6">
                            {/* Step indicators */}
                            <div className="flex justify-between mb-6">
                                {["Basics", "Details", "Review"].map((label, index) => (
                                <Button
                                    key={index}
                                    onClick={() => goToStep(index + 1)}
                                    className={`flex-1 py-2 mx-1 rounded-lg text-sm font-medium transition-all
                                    ${
                                        step === index + 1
                                        ? "bg-core text-white hover:bg-core/90"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    }`}
                                >
                                    {label}
                                </Button>
                                ))}
                            </div>

                            {/* Step 1: Basics */}
                            {step === 1 && (
                                <div className="space-y-3">
                                <h2 className="text-md font-semibold mb-2">Company Basic Information</h2>

                                <Field>
                                    <FieldLabel className="text-xs" htmlFor="name">
                                    Company Name{requiredFields.includes("name") ? (
                                            <><span className="text-red-500 ml-1">*</span></>
                                        ) : (       '')}
                                        <FieldDescription className="ml-1 text-gray-500 text-[10px]">
                                            {checkingName ? (
                                                <span className="flex items-center">
                                                <Spinner className="mr-1 size-3" /> Checking name...
                                                </span>
                                            ) : nameExists === true ? (
                                                <span className="text-red-500">Name already in use</span>
                                            ) : nameExists === false ? (
                                                <span className="text-green-500">Name is available</span>
                                            ) : null}
                                            </FieldDescription>
                                    </FieldLabel>
                                    <Input type="text" name="name" placeholder="Company Name" value={formData.name} onChange={handleChange}  className={cn(
                                    "w-full text-xs border p-2 rounded-lg transition-colors",
                                    nameExists === true
                                        ? "border-red-500 focus-visible:ring-red-400"
                                        : nameExists === false
                                        ? "border-green-500 focus-visible:ring-green-400"
                                        : ""
                                    )} />
                                </Field>

                                <Field>
                                    <FieldLabel className="text-xs" htmlFor="type">
                                    Company Type{requiredFields.includes("type") ? (
                                            <><span className="text-red-500 ml-1">*</span></>
                                        ) : (       '')}
                                    </FieldLabel>
                                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                      <SelectTrigger className="w-full text-xs border rounded-lg">
                                        <SelectValue placeholder="Select Company Type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="product">Product-based</SelectItem>
                                        <SelectItem value="service">Service-based</SelectItem>
                                        <SelectItem value="project">Project-based</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FieldDescription className="text-xs ml-1" />
                                </Field>

                                <Field>
                                    <FieldLabel className="text-xs" htmlFor="email">
                                    Company Email{requiredFields.includes("email") ? (
                                            <><span className="text-red-500 ml-1">*</span></>
                                        ) : (       '')}
                                    </FieldLabel>
                                    <Input type="email" name="email" placeholder="Company Email" value={formData.email} onChange={handleChange} className="w-full text-xs border p-2 rounded-lg" />
                                    <FieldDescription className="text-xs ml-1" />
                                </Field>

                                <Field>
                                    <FieldLabel className="text-xs" htmlFor="phone">
                                    Phone Number {requiredFields.includes("phone") ? (
                                            <><span className="text-red-500 ml-1">*</span></>
                                        ) : (       '')}
                                    </FieldLabel>
                                    <Input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full text-xs border p-2 rounded-lg" />
                                </Field>

                                <Field>
                                    <FieldLabel className="text-xs" htmlFor="country">
                                    Country / Location{requiredFields.includes("country") ? (
                                            <><span className="text-red-500 ml-1">*</span></>
                                        ) : (       '')}
                                    </FieldLabel>
                                    <Input type="text" name="country" placeholder="Country / Location" value={formData.country} onChange={handleChange} className="w-full text-xs border p-2 rounded-lg" />
                                </Field>
                                </div>
                            )}

                            {/* Step 2: Details */}
                            {step === 2 && (
                                <div className="space-y-3">
                                <h2 className="text-md font-semibold mb-2">Company Details</h2>

                                                                <Field>
                                                                        <FieldLabel className="text-xs" htmlFor="industry">
                                                                        Industry {requiredFields.includes("industry") ? (
                                                                                        <><span className="text-red-500 ml-1">*</span></>
                                                                                ) : (       '')}
                                                                        </FieldLabel>
                                                                        <Input type="text" name="industry" placeholder="Industry (e.g., Retail, IT, Construction)" value={formData.industry} onChange={handleChange} className="w-full border text-xs p-2 rounded-lg" />
                                                                </Field>

                                                                <Field>
                                                                        <FieldLabel className="text-xs" htmlFor="branchAddress">
                                                                        Head Office Address
                                                                        </FieldLabel>
                                                                        <Input type="text" name="branchAddress" placeholder="Head office address (stored on branch)" value={formData.branchAddress} onChange={handleChange} className="w-full border text-xs p-2 rounded-lg" />
                                                                </Field>

                                                                <Field>
                                                                        <FieldLabel className="text-xs" htmlFor="branchCity">
                                                                        Head Office City
                                                                        </FieldLabel>
                                                                        <Input type="text" name="branchCity" placeholder="Head office city (stored on branch)" value={formData.branchCity} onChange={handleChange} className="w-full border text-xs p-2 rounded-lg" />
                                                                </Field>

                                                                <Field>
                                                                        <FieldLabel className="text-xs" htmlFor="currency">
                                                                        Currency {requiredFields.includes("currency") ? (
                                                                                        <><span className="text-red-500 ml-1">*</span></>
                                                                                ) : (       '')}
                                                                        </FieldLabel>
                                                                        <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                                                                            <SelectTrigger className="w-full text-xs border rounded-lg">
                                                                                <SelectValue placeholder="Select Currency" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                                                <SelectItem value="RWF">RWF - Rwandan Franc</SelectItem>
                                                                                <SelectItem value="NGN">NGN - Naira</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                </Field>


                                <Field>
                                    <FieldLabel className="text-xs" htmlFor="taxId">
                                    Tax ID / Registration Number
                                    </FieldLabel>
                                    <Input type="text" name="taxId" placeholder="Tax ID / Registration Number" value={formData.taxId} onChange={handleChange} className="w-full text-xs border p-2 rounded-lg" />
                                </Field>
                                </div>
                            )}

                            {/* Step 3: Review */}
                            {step === 3 && (
                                <div>
                                <h2 className="text-md font-semibold mb-3">Review Company Information</h2>
                                <div className="space-y-2 text-xs ml-3 text-gray-700">
                                    {Object.entries(formData).map(([key, value]) => {
                                    const label = key
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, (str) => str.toUpperCase());
                                    const isRequired = requiredFields.includes(key);
                                    return (
                                        <p key={key}>
                                        <strong className="capitalize">
                                            {label}
                                            {isRequired && <span className="text-red-500 ml-1">*</span>}:
                                        </strong>{" "}
                                        {value || <span className="text-gray-400">Not provided</span>}
                                        </p>
                                    );
                                    })}
                                </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-6">
                                <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={step === 1}
                                className={`px-4 py-2 rounded-lg border ${
                                    step === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                                }`}
                                >
                                <ArrowLeft className="mr-1" /> Back
                                </Button>

                                {step < 3 ? (
                                <Button
                                    onClick={nextStep}
                                    className="px-4 py-2 bg-core text-white rounded-lg hover:bg-core/90"
                                >
                                    Next <ArrowRight className="ml-1" />
                                </Button>
                                ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className={`px-4 py-2 text-white rounded-lg ${
                                    isFormValid
                                        ? "bg-army hover:bg-army/90"
                                        : "bg-gray-300 cursor-not-allowed"
                                    }`}
                                >
                                    {isLoading&&<Spinner spinning={isLoading}/>}Create Company
                                </Button>
                                )}
                            </div>
                            </div>
                    
                </div>       
            </div>
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
