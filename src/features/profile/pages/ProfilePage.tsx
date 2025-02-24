import { useEffect, useRef } from "react";
import { PageContainer } from "~/components/layout/PageContainer";
import { SectionContainer } from "~/components/layout/SectionContainer";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { api } from "~/utils/api";
import { EditProfileFormInner } from "../components/EditProfileFormInner";
import { AuthRoute } from "~/components/layout/AuthRoute";
import { useForm } from "react-hook-form";
import {
  editProfileFormSchema,
  type EditProfileFormSchema,
} from "../forms/edit-profile";
import { Form } from "~/components/ui/form";
import { toast } from "sonner";
import { TRPCError } from "@trpc/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";

const ProfilePage = () => {
  const form = useForm<EditProfileFormSchema>({
    resolver: zodResolver(editProfileFormSchema),
  });

  const { data: getProfileData } = api.profile.getProfile.useQuery();

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: async ({ bio, username }) => {
      form.reset({ bio: bio ?? "", username });
      toast.success("Berhasil updated profile");
    },
    onError: (err) => {
      console.log(err);
      if (err instanceof TRPCClientError) {
        if (err.message === "USERNAME_USED") {
          form.setError("username", {
            message: "Username sudah digunakan",
          });
        }
      }
      toast.error("Gagal update profile");
    },
  });

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfileSubmit = (values: EditProfileFormSchema) => {
    const payload: {
      username?: string;
      bio?: string;
    } = {};

    if (values.username !== getProfileData?.username) {
      payload.username = values.username;
    }
    if (values.bio !== getProfileData?.bio) {
      payload.bio = values.bio;
    }

    updateProfile.mutate({
      ...payload,
    });
  };

  const handleOpenFileExplorer = () => {
    inputFileRef.current?.click();
  };

  const editProfileFormHasChanges =
    getProfileData?.username !== form.watch("username") ||
    getProfileData?.bio !== form.watch("bio");

  useEffect(() => {
    if (getProfileData) {
      form.setValue("username", getProfileData.username ?? "");
      form.setValue("bio", getProfileData.bio ?? "");
    }
  }, [getProfileData]);

  return (
    <AuthRoute>
      <PageContainer>
        <SectionContainer padded minFullscreen className="gap-y-6 py-8">
          <h1 className="text-2xl font-semibold">Profile Settings</h1>
          <Card>
            <CardContent className="flex gap-6 pt-6">
              <div className="flex flex-col gap-4">
                <Avatar className="size-24">
                  <AvatarFallback>VF</AvatarFallback>
                  <AvatarImage />
                </Avatar>
                <Button onClick={handleOpenFileExplorer} size="sm">
                  Ganti Foto
                </Button>
                <input className="hidden" type="file" ref={inputFileRef} />
              </div>

              <div className="grid flex-1 grid-cols-2">
                {getProfileData && (
                  <Form {...form}>
                    <EditProfileFormInner
                      defaultValues={{
                        bio: getProfileData?.bio,
                        username: getProfileData?.username,
                      }}
                    />
                  </Form>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex w-full justify-end gap-4">
            <Button
              disabled={!form.formState.isDirty}
              onClick={form.handleSubmit(handleUpdateProfileSubmit)}
            >
              Simpan
            </Button>
          </div>
        </SectionContainer>
      </PageContainer>
    </AuthRoute>
  );
};

export default ProfilePage;
