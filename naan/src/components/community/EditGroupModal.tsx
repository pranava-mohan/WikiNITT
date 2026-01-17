import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GraphQLClient } from "graphql-request";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UPDATE_GROUP, UPLOAD_USER_IMAGE_MUTATION } from "@/queries/community";
import { UpdateGroupMutation } from "@/gql/graphql";
import { X, Camera, Loader2 } from "lucide-react";
import { print } from "graphql";

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: {
    id: string;
    name: string;
    description: string;
    icon?: string | null;
    slug: string;
  };
}

interface GroupFormData {
  name: string;
  description: string;
  icon: string;
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  onClose,
  group,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [previewImage, setPreviewImage] = useState<string>(group.icon || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GroupFormData>({
    defaultValues: {
      name: group.name,
      description: group.description,
      icon: group.icon || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: group.name,
        description: group.description,
        icon: group.icon || "",
      });
      setPreviewImage(group.icon || "");
      setError(null);
    }
  }, [isOpen, group, reset]);

  const getClient = () => {
    if (!session?.backendToken) return null;
    return new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHQL_API_URL!, {
      headers: { Authorization: `Bearer ${session.backendToken}` },
    });
  };

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!session?.backendToken) throw new Error("Not authenticated");

      const formData = new FormData();
      const operations = {
        query: print(UPLOAD_USER_IMAGE_MUTATION),
        variables: {
          file: null,
        },
      };
      formData.append("operations", JSON.stringify(operations));
      formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
      formData.append("0", file);

      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL!, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.backendToken}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      return result.data.uploadUserImage;
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      const client = getClient();
      if (!client) throw new Error("Not authenticated");
      return client.request(UPDATE_GROUP, {
        groupId: group.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
      });
    },
    onSuccess: async (data: any) => {
      // cast to any because Types might not be generated yet for UpdateGroupMutation
      const newSlug = data?.updateGroup?.slug;

      queryClient.invalidateQueries({
        queryKey: ["group", group.slug],
      });

      onClose();

      if (newSlug !== group.slug) {
        router.push(`/c/${newSlug}`);
      } else {
        router.refresh(); // Refresh server components if any
        // Force reload to ensure everything updates if router.refresh is not enough
        window.location.reload();
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to update group");
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);

      const url = await uploadImageMutation.mutateAsync(file);
      setValue("icon", url);
    } catch (err) {
      setError((err as Error).message || "Failed to upload image");
      setPreviewImage(group.icon || "");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: GroupFormData) => {
    updateGroupMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Group Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Group Icon Preview"
                    className="w-full h-full object-cover"
                    width={96}
                    height={96}
                  />
                ) : (
                  <span className="text-2xl text-gray-400 font-bold">
                    {group.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <label
                htmlFor="icon-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <Camera className="w-8 h-8 text-white" />
              </label>
              <input
                id="icon-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploading || isSubmitting}
              />
            </div>
            {uploading && (
              <p className="text-sm text-blue-600 mt-2">Uploading...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              {...register("name", {
                required: "Group name is required",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters",
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting || uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {(isSubmitting || uploading) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
