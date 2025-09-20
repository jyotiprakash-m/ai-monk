import React from 'react'
import { CreateProject } from './components/CreateProject'
import AllProjects from './components/AllProjects'

const RagAppPage = () => {
  return (
    <div className='container mx-auto py-10 px-4'>
        <div className='flex justify-between items-center mb-8'>
            <h1 className='text-xl font-bold'>All Projects</h1>
            <CreateProject/>
        </div>
        <AllProjects />
    </div>
  )
}

export default RagAppPage