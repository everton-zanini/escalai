import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AssigneeAvatarsProps {
  people: { id: number; name: string }[];
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AssigneeAvatars({ people }: AssigneeAvatarsProps) {
  if (people.length === 0) {
    return <p className="text-sm text-muted-foreground">Ninguém escalado</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {people.map((person) => (
        <div key={person.id} className="flex items-center gap-1.5">
          <Avatar className="size-6">
            <AvatarFallback className="text-xs">{initials(person.name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{person.name}</span>
        </div>
      ))}
    </div>
  );
}
