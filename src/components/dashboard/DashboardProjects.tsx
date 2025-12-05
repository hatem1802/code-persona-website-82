import { useState, useEffect } from "react";
import {
  Plus,
  Briefcase,
  Trash,
  Edit,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { supabaseApi, Project, Category } from "@/utils/supabaseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EditProjectForm } from "@/components/dashboard/EditProjectForm";
import axios from "axios";

// Extended project type with created_at
type ProjectWithDates = Project & {
  _id: string;
  created_at?: string;
};

// Add Project Form
function AddProjectForm({
  onAdd,
  categories,
  fetchProjects,
}: {
  onAdd: (project, formdata) => void;
  categories: Category[];
  fetchProjects;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState("");
  const [githubURL, setGithub] = useState("");
  const [liveURL, setDemo] = useState("");
  const [category, setCategory] = useState(categories[0]?.category);
  const [sorting, setSorting] = useState("5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("imageFile", file);

    onAdd(
      {
        title: title,
        description: description,
        skills: skills,
        githubURL: githubURL,
        liveURL: liveURL,
        category: category,
        fileName: file.name,
        sorting: sorting,
      },
      formData
    );

    fetchProjects();

    setTitle("");
    setDescription("");
    setFile(null);
    setSkills("");
    setGithub("");
    setDemo("");
    setCategory(categories[0]?.category);
    setSorting("5");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900/90 rounded-lg p-6 mb-6 space-y-4 border border-portfolio-purple"
    >
      <h3 className="text-lg font-semibold flex items-center gap-2 text-portfolio-purple mb-2">
        <Briefcase size={18} /> Add New Project
      </h3>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1"
          placeholder="Project title"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="mt-1"
          placeholder="Project description"
        />
      </div>
      <div>
        <Label htmlFor="image">Project Photo</Label>
        <Input
          type="file"
          id="image"
          onChange={(e) => setFile(e.target.files[0])}
          className="mt-1"
          placeholder="Paste an image URL"
        />
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="mt-1"
          placeholder="e.g. React, Node.js, CSS"
        />
      </div>
      <div>
        <Label htmlFor="github">GitHub URL</Label>
        <Input
          id="github"
          value={githubURL}
          onChange={(e) => setGithub(e.target.value)}
          className="mt-1"
          placeholder="https://github.com/your-repo"
        />
      </div>
      <div>
        <Label htmlFor="demo">Demo URL</Label>
        <Input
          id="demo"
          value={liveURL}
          onChange={(e) => setDemo(e.target.value)}
          className="mt-1"
          placeholder="https://your-demo.com"
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-md text-white p-2"
        >
          {categories.map((cat) => (
            <option key={cat._id} value={cat.category}>
              {cat.category}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="sortOrder">
          Display Order (lower numbers appear first)
        </Label>
        <Input
          id="sortOrder"
          type="number"
          min="1"
          value={sorting}
          onChange={(e) => setSorting(e.target.value)}
          className="mt-1"
          placeholder="Enter a number for sorting"
        />
      </div>
      <Button
        type="submit"
        className="mt-3 bg-portfolio-purple text-white hover:bg-portfolio-purple/80"
      >
        <Plus size={16} /> Add Project
      </Button>
    </form>
  );
}

// Project Item Component
function ProjectItem({
  project,
  onDelete,
  onEdit,
  onMoveSortOrder,
}: {
  project: ProjectWithDates;
  onDelete: (id: string) => void;
  onEdit: (project: ProjectWithDates) => void;
  onMoveSortOrder: (project, direction: "up" | "down") => void;
}) {
  return (
    <li className="border-b border-zinc-800 pb-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 bg-zinc-900 px-2 py-0.5 rounded">
              {project.sorting}
            </span>
            <span className="font-semibold text-white">{project.title}</span>{" "}
            <span className="text-xs text-gray-400">in {project.category}</span>
          </div>
          <div className="text-xs text-gray-500">{project.description}</div>
          {project.skills && project.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {project.skills.map((s, i) => (
                <span
                  key={i}
                  className="bg-portfolio-purple/40 text-xs px-2 py-0.5 rounded text-white"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          {(project.githubURL || project.liveURL) && (
            <div className="flex gap-4 mt-1">
              {project.githubURL && (
                <a
                  href={project.githubURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-200"
                >
                  GitHub
                </a>
              )}
              {project.liveURL && (
                <a
                  href={project.liveURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-200"
                >
                  Demo
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-300 p-1 rounded"
            onClick={() => onMoveSortOrder(project, "up")}
            title="Move up"
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-300 p-1 rounded"
            onClick={() => onMoveSortOrder(project, "down")}
            title="Move down"
          >
            <ArrowDown size={16} />
          </button>
          <button
            type="button"
            className="text-blue-400 hover:text-blue-300 p-1 rounded"
            onClick={() => onEdit(project)}
          >
            <Edit size={16} />
          </button>
          <button
            type="button"
            className="text-red-400 hover:text-red-300 p-1 rounded"
            onClick={() => onDelete(project._id)}
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
    </li>
  );
}

// Main Dashboard Projects Component
export const DashboardProjects = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectWithDates[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProject, setEditingProject] = useState<ProjectWithDates | null>(
    null
  );

  // Load projects and categories
  const fetchProjects = async () => {
    try {
      fetch("https://portfolio-backend-production-6392.up.railway.app/api/projects")
        .then((res) => res.json())
        .then((data) => setProjects(data));
      fetch("https://portfolio-backend-production-6392.up.railway.app/api/categs")
        .then((res) => res.json())
        .then((data) => setCategories(data));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [toast]);

  // Sorted projects list

  // Handle updating project sort order
  const handleMoveSortOrder = async (project, direction: "up" | "down") => {
    let newSorting;
    if (direction === "up") {
      newSorting = {
        sorting: Number(project.sorting) - 1,
      };
    } else if (direction === "down") {
      newSorting = {
        sorting: Number(project.sorting) + 1,
      };
    }

    try {
      // Update the project's sort order
      const updatedProject = await axios.put(
        `https://portfolio-backend-production-6392.up.railway.app/api/projects/${project._id}`,
        newSorting
      );

      if (updatedProject) {
        // Update local state
        fetchProjects();

        toast({
          title: "Success",
          description: "Project order updated.",
        });
      }
    } catch (error) {
      console.error("Error updating project order:", error);
      toast({
        title: "Error",
        description: "Failed to update project order.",
        variant: "destructive",
      });
    }
  };

  // Handle adding a new project
  const handleAddProject = async (projectData, formdata) => {
    try {
      const projectTextData = await axios.post(
        "https://portfolio-backend-production-6392.up.railway.app/api/projects",
        projectData
      );
      const projectImage = await axios.post(
        "https://portfolio-backend-production-6392.up.railway.app/api/projects/image",
        formdata
      );
      if (projectTextData) {
        fetchProjects();
      }
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  // Handle editing a project
  const handleEditProject = (project: ProjectWithDates) => {
    setEditingProject(project);
  };

  // Handle saving an edited project
  const handleSaveProject = async (
    id: string,
    updatedProject: Partial<Project>
  ) => {
    try {
      const updated = await axios.put(
        `https://portfolio-backend-production-6392.up.railway.app/api/projects/${id}`,
        updatedProject
      );
      // update displaying projects
      fetchProjects();
      setEditingProject(null);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  // Handle deleting a project
  const handleDeleteProject = async (id: string) => {
    try {
      const deleteProject = await axios.delete(
        `https://portfolio-backend-production-6392.up.railway.app/api/projects/${id}`
      );
      setProjects((prev) => prev.filter((project) => project._id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="grid gap-10">
      <AddProjectForm
        onAdd={handleAddProject}
        categories={categories}
        fetchProjects={fetchProjects}
      />

      <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-portfolio-purple mb-4">
          Current Projects
        </h3>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-400">No projects added yet.</p>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => (
              <ProjectItem
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
                onEdit={handleEditProject}
                onMoveSortOrder={handleMoveSortOrder}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Project Edit Dialog */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <EditProjectForm
              project={editingProject}
              categories={categories}
              onSave={handleSaveProject}
              onCancel={() => setEditingProject(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
