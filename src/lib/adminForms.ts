import type { Project, MediaDocument } from "./db/schema";
import type { ProjectValues } from "../components/admin/ProjectForm.astro";
import type { MediaValues } from "../components/admin/MediaForm.astro";

const str = (form: FormData, key: string) => String(form.get(key) ?? "");

export const emptyProjectValues: ProjectValues = {
  name: "", type: "", year: "", location: "", client: "",
  direction: "", summary: "", description: "", published: true, sortOrder: 0,
};

export function projectValuesFromProject(p: Project): ProjectValues {
  return {
    name: p.name, type: p.type, year: p.year ?? "", location: p.location ?? "",
    client: p.client ?? "", direction: p.direction ?? "", summary: p.summary ?? "",
    description: p.description ?? "", published: p.published, sortOrder: p.sortOrder,
  };
}

export function projectValuesFromForm(form: FormData): ProjectValues {
  return {
    name: str(form, "name"), type: str(form, "type"), year: str(form, "year"),
    location: str(form, "location"), client: str(form, "client"),
    direction: str(form, "direction"), summary: str(form, "summary"),
    description: str(form, "description"),
    published: form.get("published") === "1", sortOrder: str(form, "sortOrder"),
  };
}

export const emptyMediaValues: MediaValues = {
  title: "", docDate: "", published: true, sortOrder: 0,
};

export function mediaValuesFromDoc(d: MediaDocument): MediaValues {
  return {
    title: d.title, docDate: d.docDate ?? "", published: d.published, sortOrder: d.sortOrder,
  };
}

export function mediaValuesFromForm(form: FormData): MediaValues {
  return {
    title: str(form, "title"), docDate: str(form, "docDate"),
    published: form.get("published") === "1", sortOrder: str(form, "sortOrder"),
  };
}
